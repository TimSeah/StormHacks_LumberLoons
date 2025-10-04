"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authHeader;
function authHeader() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.accessToken) {
        return { Authorization: "Bearer " + user.accessToken };
    }
    else {
        return { Authorization: " " };
    }
}
//# sourceMappingURL=auth-header.js.map