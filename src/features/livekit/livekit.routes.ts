import { Router } from "express";
import { AccessToken } from "livekit-server-sdk";

const router = Router();


router.post("/token", async (req, res) => {
  console.log("Hit /livekit/token with body:", req.body); //debug
  console.log("API Key:", process.env.LIVEKIT_API_KEY); //debug
  console.log("API Secret:", process.env.LIVEKIT_API_SECRET?.slice(0,6) + "..."); //debug

  const { identity, roomName } = req.body;

  if (!identity || !roomName) {
    return res.status(400).json({ error: "identity and roomName are required" });
  }

  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;

  const at = new AccessToken(apiKey, apiSecret, { identity });
  at.addGrant({ roomJoin: true, room: roomName });

  //await the JWT
  const jwt = await at.toJwt();

  res.json({ token: jwt });
});


export default router;