"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerAuthRoutes;
const avatarRoutes_1 = __importDefault(require("./avatarRoutes"));
const friends_1 = __importDefault(require("./friends"));
const googleAuthRoutes_1 = __importDefault(require("./googleAuthRoutes"));
const userRoutes_1 = __importDefault(require("./userRoutes"));
const profile_1 = __importDefault(require("./profile"));
const registerRoutes_1 = __importDefault(require("./registerRoutes"));
const signinRoutes_1 = __importDefault(require("./signinRoutes"));
const signoutRoutes_1 = __importDefault(require("./signoutRoutes"));
const twofaRoutes_1 = __importDefault(require("./twofaRoutes"));
async function registerAuthRoutes(app) {
    await (0, registerRoutes_1.default)(app);
    await (0, signinRoutes_1.default)(app);
    await (0, signoutRoutes_1.default)(app);
    await (0, userRoutes_1.default)(app);
    await (0, avatarRoutes_1.default)(app);
    await (0, twofaRoutes_1.default)(app);
    await (0, friends_1.default)(app);
    await (0, profile_1.default)(app);
    await (0, googleAuthRoutes_1.default)(app);
}
