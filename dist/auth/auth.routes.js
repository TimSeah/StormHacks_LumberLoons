"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
// Authentication routes for endpoints, handlers in auth.controller.ts
// mounted in /api/auth
router.post("/signup", auth_controller_1.signup);
router.post("/signin", auth_controller_1.signin);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map