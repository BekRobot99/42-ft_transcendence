import { FastifyInstance } from 'fastify';
import avatarRoutes from './avatarRoutes';
import userRoutes from './userRoutes';
import registerRoutes from './registerRoutes';
import signinRoutes from './signinRoutes';
import signoutRoutes from './signoutRoutes';
import twofaRoutes from './twofaRoutes';

export default async function registerAuthRoutes(app: FastifyInstance) {

    await registerRoutes(app);
    await signinRoutes(app);
    await signoutRoutes(app);
    await userRoutes(app);
    await avatarRoutes(app);
    await twofaRoutes(app);

}
