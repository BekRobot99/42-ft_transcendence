import { FastifyInstance } from 'fastify';

export default async function signoutRoutes(app: FastifyInstance) {
    app.post('/api/signout', async (request, reply) => {
        reply.clearCookie('token', { path: '/' });
        reply.status(200).send({ message: 'Signed out.' });
    });
}