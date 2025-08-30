import '@fastify/jwt';
import 'fastify';

// This module declaration augments the FastifyInstance interface
declare module 'fastify' {
    export interface FastifyInstance {
        // This declares the 'authenticate' decorator added by the auth plugin
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}

// This module declaration augments the @fastify/jwt plugin's types
declare module '@fastify/jwt' {
    // This interface defines the structure of the JWT payload
    export interface FastifyJWT {
        payload: {
            id: number;
            username: string;
            // 'tfa' is optional as it's not present in all tokens
            tfa?: 'pending' | 'complete';
        };
        // This defines the shape of `request.user`
        user: {
            id: number;
            username: string;
            tfa?: 'pending' | 'complete';
        };
    }
}
