import express from "express";
import cors from "cors";
import livekitRoutes from "./features/livekit/livekit.routes";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/livekit", livekitRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


