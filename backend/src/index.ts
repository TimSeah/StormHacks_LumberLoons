// import express from "express";
// import cors from "cors";
// import livekitRoutes from "./features/livekit/livekit.routes";
// import dotenv from "dotenv";
// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.use("/livekit", livekitRoutes);

// const port = process.env.PORT || 3000;

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import authRouter from "./auth/auth.routes";
import livekitRoutes from "./features/livekit/livekit.routes";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// serve static files from /public
app.use(express.static(path.join(__dirname, "../public")));

// mount your API routes
app.use("/livekit", livekitRoutes);
app.use("/auth", authRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
