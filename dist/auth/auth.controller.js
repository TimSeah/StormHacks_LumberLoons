"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.signin = exports.signup = void 0;
const jwt = __importStar(require("jsonwebtoken"));
// bcryptjs provides a CommonJS export; using require avoids default-import problems
const bcrypt = require("bcryptjs");
const users = [];
let nextId = 1;
// JWT token secret and expiration
const JWT_SECRET = process.env.JWT_SECRET || "remove-this-secret-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h-remove-in-production";
//signup creates a new user and returns a JWT token
const signup = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "username and password required" });
    const exists = users.find((u) => u.username === username);
    if (exists)
        return res.status(409).json({ message: "username taken" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = { id: nextId++, username, passwordHash };
    users.push(user);
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ id: user.id, username: user.username, accessToken: token });
};
exports.signup = signup;
// signin verifies user credentials and returns a JWT token
const signin = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: "username and password required" });
    const user = users.find((u) => u.username === username);
    if (!user)
        return res.status(401).json({ message: "invalid credentials" });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
        return res.status(401).json({ message: "invalid credentials" });
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ id: user.id, username: user.username, accessToken: token });
};
exports.signin = signin;
//# sourceMappingURL=auth.controller.js.map