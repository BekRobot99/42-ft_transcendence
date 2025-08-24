import fastifyCors from '@fastify/cors';
import 'dotenv/config';
import Fastify from 'fastify';
import { setupDatabase } from './config/database';
import authRoutes from './api/auth';

const app = Fastify({
    logger: true,
});

// Register CORS plugin
app.register(fastifyCors, { // Updated registration
    origin: '*', // Allow all origins (for now). If we want to host the project on a public domain, we should restrict
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// Register JWT plugin
app.register(async (instance) => {
    const fastifyJwt = (await import('@fastify/jwt')).default;
    instance.register(fastifyJwt, {
        secret: process.env.JWT_SECRET || 'dev-secret',
        cookie: {
            cookieName: 'authToken',
            signed: false,
        },
    });
});

// Register cookie parser (for JWT in cookies)
app.register(import('@fastify/cookie'));

// Decorate request with JWT verify
app.decorate("authenticate", async function(request: any, reply: any) {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.status(401).send({ message: 'Unauthorized' });
    }
});

// Register routes
app.register(authRoutes);

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
