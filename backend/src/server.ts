import fastifyCors from "@fastify/cors"; // Updated import
import fastifyHelmet from '@fastify/helmet';
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyStatic from "@fastify/static";
import fastifyWebsocket from '@fastify/websocket';
import "dotenv/config";
import Fastify from "fastify";
import fs from "fs";
import path from "path";
import { setupDatabase } from "./config/database";
import authRoutes from "./api/auth";
import tournamentRoutes from "./api/tournament";
import realtimeRoutes from './websocket';

const app = Fastify({
    logger: true,
});

// Create uploads directory if it doesn't exist
const avatarUploadPath = path.join(process.cwd(), "uploads", "avatars");
if (!fs.existsSync(avatarUploadPath)) {
    fs.mkdirSync(avatarUploadPath, { recursive: true });
}

// Serve static files from the uploads directory
app.register(fastifyStatic, {
    root: path.join(process.cwd(), "uploads"),
    prefix: "/uploads/",
});

// Register CORS plugin
app.register(fastifyCors, { // Updated registration
    origin: '*', // Allow all origins (for now). If we want to host the project on a public domain, we should restrict
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

// Register WebSocket plugin
app.register(fastifyWebsocket);

// Register JWT plugin
const jwtSecret = process.env.JWT_SECRET || "render_production_jwt_secret_2024_transcendence_secure_key";
if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET environment variable not set, using fallback value');
}

// Register JWT plugin on main app instance
app.register(fastifyJwt, {
    secret: jwtSecret,
    cookie: {
        cookieName: "authToken",
        signed: false,
    },
});


// Register cookie parser (for JWT in cookies)
app.register(import("@fastify/cookie"));

// Register multipart plugin for file uploads
app.register(fastifyMultipart, {
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

// Register rate-limit plugin
app.register(fastifyRateLimit, {
  max: 100,                 // max 100 requests per IP
  timeWindow: '1 minute',
  ban: 5 * 60 * 1000        // ban for 5 minutes
});


// Register security headers plugin
app.register(fastifyHelmet);

// Decorate request with JWT verify
app.decorate("authenticate", async function(request: any, reply: any) {
    try {
        await request.jwtVerify();
        // A user is only fully authenticated if they have passed all steps, including 2FA if enabled.
        // The 'tfa' claim in the token must be 'complete'.
        if (request.user.tfa !== "complete") {
            throw new Error("Authentication incomplete, 2FA may be required.");
        }
    } catch (err) {
        reply.status(401).send({ message: "Unauthorized" });
    }
});

// Health check endpoint for Render.com
app.get('/api/health', async (request: any, reply: any) => {
    reply.status(200).send({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'ft_transcendence_backend'
    });
});

// Register routes
app.register(authRoutes);
app.register(tournamentRoutes);
app.register(realtimeRoutes);

const startServer  = async () => {
    try {
        await setupDatabase();
        const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
        await app.listen({ port, host: '0.0.0.0' }); // Listen on all available network interfaces
        app.log.info(`Backend server listening on ${app.server.address()?.toString()}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

startServer();
