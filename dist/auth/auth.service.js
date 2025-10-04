"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.logout = exports.register = exports.login = void 0;
const axios_1 = __importDefault(require("axios"));
const API_URL = "http://localhost:8080/api/auth/";
// wrapperfor backend auth API endpoints
const login = async (username, password) => {
    const response = await axios_1.default.post(API_URL + "signin", {
        username,
        password,
    });
    if (response.data.accessToken) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
};
exports.login = login;
// add signup functionality 
const register = async (username, password) => {
    const response = await axios_1.default.post(API_URL + "signup", {
        username,
        password,
    });
    return response.data;
};
exports.register = register;
const logout = () => {
    localStorage.removeItem("user");
};
exports.logout = logout;
const getCurrentUser = () => {
    const userStr = localStorage.getItem("user");
    if (userStr)
        return JSON.parse(userStr);
    return null;
};
exports.getCurrentUser = getCurrentUser;
//end-to-end flow:
// How they work together (end-to-end flow)
// User fills login form in React and calls login(username, password) from auth.service.ts.
// login sends POST to /api/auth/signin (server auth.routes.ts → auth.controller.signin).
// Server verifies credentials using auth.controller.ts:
// lookup user, bcrypt.compare(password, storedHash).
// on success jwt.sign(...) returns accessToken.
// Server responds { id, username, accessToken }. Client stores this in localStorage.
// For protected calls, client either:
// calls authHeader() and attaches Authorization header, or
// uses an axios instance that automatically inserts Bearer <token> from getCurrentUser().
// Server protected routes use verifyToken to validate token and set req.user.
// If token is invalid/expired, server returns 401; client should handle by forcing logout or attempting refresh.
//# sourceMappingURL=auth.service.js.map