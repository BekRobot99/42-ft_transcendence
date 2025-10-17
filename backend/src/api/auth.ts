import { FastifyInstance } from 'fastify';
import avatarRoutes from './avatarRoutes';
import friendsRoutes from './friends';
import registerGoogleAuthRoutes from './googleAuthRoutes';
import userRoutes from './userRoutes';
import profileRoutes from './profile';
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
    await friendsRoutes(app);
    await profileRoutes(app);
    await registerGoogleAuthRoutes(app);
}
