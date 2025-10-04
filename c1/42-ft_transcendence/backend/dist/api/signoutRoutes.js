"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = signoutRoutes;
async function signoutRoutes(app) {
    app.post('/api/signout', async (request, reply) => {
        reply.clearCookie('authToken', { path: '/' });
        reply.status(200).send({ message: 'Signed out.' });
    });
}
