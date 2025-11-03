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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("@fastify/cors")); // Updated import
const helmet_1 = __importDefault(require("@fastify/helmet"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const static_1 = __importDefault(require("@fastify/static"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
require("dotenv/config");
const fastify_1 = __importDefault(require("fastify"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./config/database");
const auth_1 = __importDefault(require("./api/auth"));
const tournament_1 = __importDefault(require("./api/tournament"));
const websocket_2 = __importDefault(require("./websocket"));
const app = (0, fastify_1.default)({
    logger: true,
});
// Create uploads directory if it doesn't exist
const avatarUploadPath = path_1.default.join(process.cwd(), "uploads", "avatars");
if (!fs_1.default.existsSync(avatarUploadPath)) {
    fs_1.default.mkdirSync(avatarUploadPath, { recursive: true });
}
// Serve static files from the uploads directory
app.register(static_1.default, {
    root: path_1.default.join(process.cwd(), "uploads"),
    prefix: "/uploads/",
});
// Register CORS plugin
app.register(cors_1.default, {
    origin: '*', // Allow all origins (for now). If we want to host the project on a public domain, we should restrict
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});
// Register WebSocket plugin
app.register(websocket_1.default);
// Register JWT plugin
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set!');
}
// Register JWT plugin on main app instance
app.register(jwt_1.default, {
    secret: process.env.JWT_SECRET ?? "default_jwt_secret",
    cookie: {
        cookieName: "authToken",
        signed: false,
    },
});
// Register cookie parser (for JWT in cookies)
app.register(Promise.resolve().then(() => __importStar(require("@fastify/cookie"))));
// Register multipart plugin for file uploads
app.register(multipart_1.default, {
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
// Register rate-limit plugin
app.register(rate_limit_1.default, {
    max: 100, // max 100 requests per IP
    timeWindow: '1 minute',
    ban: 5 * 60 * 1000 // ban for 5 minutes
});
// Register security headers plugin
app.register(helmet_1.default);
// Decorate request with JWT verify
app.decorate("authenticate", async function (request, reply) {
    try {
        await request.jwtVerify();
        // A user is only fully authenticated if they have passed all steps, including 2FA if enabled.
        // The 'tfa' claim in the token must be 'complete'.
        if (request.user.tfa !== "complete") {
            throw new Error("Authentication incomplete, 2FA may be required.");
        }
    }
    catch (err) {
        reply.status(401).send({ message: "Unauthorized" });
    }
});
// Health check endpoint for Render.com
app.get('/api/health', async (request, reply) => {
    reply.status(200).send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'ft_transcendence_backend'
    });
});
// Register routes
app.register(auth_1.default);
app.register(tournament_1.default);
app.register(websocket_2.default);
const startServer = async () => {
    try {
        await (0, database_1.setupDatabase)();
        const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
        await app.listen({ port, host: '0.0.0.0' }); // Listen on all available network interfaces
        app.log.info(`Backend server listening on ${app.server.address()?.toString()}`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
startServer();
