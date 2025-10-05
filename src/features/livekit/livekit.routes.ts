import { Router } from "express";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

const router = Router();
const roomService = new RoomServiceClient(
  process.env.LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
)

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

router.post("/room-webhook", async (req,res) => {
  const { event, room, participant, data} = req.body;

  if (event === "tracak_published") {
    if (data.kind === "audio") {
    
    }
  }
}


export default router;