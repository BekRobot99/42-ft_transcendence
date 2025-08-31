import fastifyCors from "@fastify/cors"; // Updated import
import fastifyMultipart from "@fastify/multipart";
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
app.register(async (instance) => {
    const fastifyJwt = (await import("@fastify/jwt")).default;
    instance.register(fastifyJwt, {
        secret: process.env.JWT_SECRET ?? "default_jwt_secret",
        cookie: {
            cookieName: "authToken",
            signed: false,
        },
    });
});


// Register cookie parser (for JWT in cookies)
app.register(import("@fastify/cookie"));

// Register multipart plugin for file uploads
app.register(fastifyMultipart, {
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});

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
