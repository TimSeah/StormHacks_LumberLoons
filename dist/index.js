"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const auth_jwt_1 = require("./auth/auth.jwt");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT || 8080);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: CLIENT_ORIGIN,
    credentials: true,
}));
app.get("/", (_req, res) => {
    res.send("test");
});
app.use("/api/auth", auth_routes_1.default);
// protected example
app.get("/api/protected", auth_jwt_1.verifyToken, (req, res) => {
    res.json({ message: "protected data", user: req.user });
});
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`CORS origin: ${CLIENT_ORIGIN}`);
});
//# sourceMappingURL=index.js.map