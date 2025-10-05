import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
// bcryptjs provides a CommonJS export; using require avoids default-import problems
const bcrypt = require("bcryptjs");
import User, { IUser } from "../models/User";

// JWT token secret and expiration
const JWT_SECRET = process.env.JWT_SECRET || "remove-this-secret-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

//signup creates a new user and returns a JWT token
export const signup = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "username and password required" });

    const exists = await User.findOne({ username }).exec();
    if (exists) return res.status(409).json({ message: "username taken" });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ username, passwordHash, streak: 0 }) as IUser;
    await newUser.save();

    const token = jwt.sign(
      { id: (newUser._id as string), username: newUser.username, streak: newUser.streak },
      JWT_SECRET as jwt.Secret,
      { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
    );

    res.json({ id: (newUser._id as string), username: newUser.username, streak: newUser.streak, accessToken: token });
  } catch (err) {
    console.error("Error in signup:", err);
    res.status(500).json({ message: "internal_server_error" });
  }
};

// signin verifies user credentials and returns a JWT token
export const signin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "username and password required" });

    const user = await User.findOne({ username }).exec() as IUser | null;
    if (!user) return res.status(401).json({ message: "invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "invalid credentials" });

    const token = jwt.sign(
      { id: user._id?.toString(), username: user.username, streak: user.streak },
      JWT_SECRET as jwt.Secret,
      { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
    );

    res.json({ id: user._id?.toString(), username: user.username, streak: user.streak, accessToken: token });
  } catch (err) {
    console.error("Error in signin:", err);
    res.status(500).json({ message: "internal_server_error" });
  }
};
