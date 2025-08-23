import fastifyCors from '@fastify/cors';
import Fastify from 'fastify';
import { setupDatabase } from './config/database';
import registerAuthRoutes from './api/auth';

const app = Fastify({
    logger: true,
});

app.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

app.register(registerAuthRoutes);

const startServer = async () => {
    try {
        await setupDatabase();
        const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
        await app.listen({ port, host: '0.0.0.0' });

        const addressInfo = app.server.address();
        if (typeof addressInfo === 'object' && addressInfo) {
            app.log.info(`Backend server listening on ${addressInfo.address}:${addressInfo.port}`);
        }
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

startServer();
