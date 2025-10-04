import { FastifyInstance, FastifyReply } from 'fastify';
import databaseConnection from '../config/database';

// Helper to run DB queries as promises
const dbGet = (query: string, params: any[] = []) => new Promise<any>((resolve, reject) => {
    databaseConnection.get(query, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
    });
});

const dbAll = (query: string, params: any[] = []) => new Promise<any[]>((resolve, reject) => {
    databaseConnection.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
    });
});

export default async function profileRoutes(fastify: FastifyInstance) {
    const authOpts = {
        preHandler: [fastify.authenticate]
    };

    fastify.get('/api/users/:username/profile', authOpts, async (request: any, reply: FastifyReply) => {
        const { username } = request.params as { username: string };

        try {
            const user = await dbGet('SELECT id, username, display_name, avatar_path, created_at FROM users WHERE username = ?', [username.toLowerCase()]);
            if (!user) {
                return reply.status(404).send({ message: 'User not found.' });
            }

            const userId = user.id;

            // Get all participant IDs for this user, which can be from different tournaments
            const userParticipants = await dbAll('SELECT id FROM tournament_participants WHERE user_id = ?', [userId]);
            if (userParticipants.length === 0) {
                // If the user has never participated in a tournament, return early
                return reply.send({
                    user,
                    stats: { wins: 0, losses: 0 },
                    matchHistory: []
                });
            }
            const participantIds = userParticipants.map(p => p.id);
            const participantIdPlaceholders = participantIds.map(() => '?').join(',');

            // Calculate wins
            const winsResult = await dbGet(`SELECT COUNT(*) as count FROM matches WHERE winner_id IN (${participantIdPlaceholders})`, participantIds);
            const wins = winsResult.count;

            // Calculate total completed matches
            const totalMatchesResult = await dbGet(
                `SELECT COUNT(*) as count FROM matches WHERE (player1_id IN (${participantIdPlaceholders}) OR player2_id IN (${participantIdPlaceholders})) AND status = 'completed'`,
                [...participantIds, ...participantIds]
            );
            const totalMatches = totalMatchesResult.count;
            const losses = totalMatches - wins;

            // Get match history
            const matchHistory = await dbAll(`
                SELECT
                    m.id,
                    m.played_at,
                    m.player1_score,
                    m.player2_score,
                    m.player1_id,
                    m.player2_id,
                    t.name as tournament_name,
                    p1.alias as player1_alias,
                    p2.alias as player2_alias,
                    u1.username as player1_username,
                    u2.username as player2_username,
                    m.winner_id
                FROM matches m
                JOIN tournaments t ON m.tournament_id = t.id
                LEFT JOIN tournament_participants p1 ON m.player1_id = p1.id
                LEFT JOIN tournament_participants p2 ON m.player2_id = p2.id
                LEFT JOIN users u1 ON p1.user_id = u1.id
                LEFT JOIN users u2 ON p2.user_id = u2.id
                WHERE (m.player1_id IN (${participantIdPlaceholders}) OR m.player2_id IN (${participantIdPlaceholders}))
                  AND m.status = 'completed'
                ORDER BY m.played_at DESC
            `, [...participantIds, ...participantIds]);

            const formattedMatchHistory = matchHistory.map(match => {
                const isPlayer1 = participantIds.includes(match.player1_id);
                const opponentAlias = isPlayer1 ? match.player2_alias : match.player1_alias;
                const opponentUsername = isPlayer1 ? match.player2_username : match.player1_username;
                const userScore = isPlayer1 ? match.player1_score : match.player2_score;
                const opponentScore = isPlayer1 ? match.player2_score : match.player1_score;
                const isWinner = participantIds.includes(match.winner_id);

                return {
                    matchId: match.id,
                    tournamentName: match.tournament_name,
                    opponent: {
                        alias: opponentAlias,
                        username: opponentUsername
                    },
                    result: isWinner ? 'Win' : 'Loss',
                    score: `${userScore} - ${opponentScore}`,
                    playedAt: match.played_at
                };
            });

            reply.send({
                user,
                stats: { wins, losses },
                matchHistory: formattedMatchHistory
            });

        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });
}
