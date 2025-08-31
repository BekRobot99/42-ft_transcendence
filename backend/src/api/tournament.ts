import { FastifyInstance, FastifyReply } from 'fastify';
import databaseConnection from '../config/database';
import { ValidTournamentName } from '../services/validators';

// Helper function to run DB queries as promises
const dbRun = (query: string, params: any[] = []) => new Promise<any>((resolve, reject) => {
    databaseConnection.run(query, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
    });
});

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


export default async function tournamentRoutes(fastify: FastifyInstance) {
    const authOpts = {
        preHandler: [fastify.authenticate]
    };

    // Create a new tournament
    fastify.post('/api/tournaments', authOpts, async (request: any, reply: FastifyReply) => {
        const { name, playerCount } = request.body as { name: string, playerCount: number };
        const creatorId = request.user.id;

        if (!name || !playerCount) {
            return reply.status(400).send({ message: 'Tournament name and player count are required.' });
        }
        if (!ValidTournamentName(name)) {
            return reply.status(400).send({ message: 'Invalid tournament name (3-32 chars, no special characters).' });
        }
        if (![2, 4, 8, 16].includes(playerCount)) {
            return reply.status(400).send({ message: 'Player count must be 2, 4, 8, or 16.' });
        }

        try {
            const creator = await dbGet('SELECT display_name FROM users WHERE id = ?', [creatorId]);
            if (!creator) {
                return reply.status(404).send({ message: 'Creator user not found.' });
            }

            const result = await dbRun(
                'INSERT INTO tournaments (name, number_of_players, creator_id) VALUES (?, ?, ?)',
                [name, playerCount, creatorId]
            );
            const tournamentId = result.lastID;

            // Add creator as the first participant
            await dbRun(
                'INSERT INTO tournament_participants (tournament_id, user_id, alias) VALUES (?, ?, ?)',
                [tournamentId, creatorId, creator.display_name]
            );

            const tournament = await dbGet('SELECT * FROM tournaments WHERE id = ?', [tournamentId]);
            reply.status(201).send(tournament);

        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    // Add a guest participant to a tournament
    fastify.post('/api/tournaments/:id/participants', authOpts, async (request: any, reply: FastifyReply) => {
        const tournamentId = parseInt(request.params.id, 10);
        const { alias } = request.body as { alias: string };
        const userId = request.user.id;

        if (!alias) {
            return reply.status(400).send({ message: 'Alias is required.' });
        }
        if (alias.length < 3 || alias.length > 16 || /<|>/g.test(alias)) {
            return reply.status(400).send({ message: 'Invalid alias (3-16 chars, no special characters).' });
        }

        try {
            const tournament = await dbGet('SELECT * FROM tournaments WHERE id = ?', [tournamentId]);
            if (!tournament) {
                return reply.status(404).send({ message: 'Tournament not found.' });
            }
            if (tournament.creator_id !== userId) {
                return reply.status(403).send({ message: 'Only the tournament creator can add participants.' });
            }
            if (tournament.status !== 'pending') {
                return reply.status(400).send({ message: 'Tournament has already started.' });
            }

            const participants = await dbAll('SELECT * FROM tournament_participants WHERE tournament_id = ?', [tournamentId]);
            if (participants.length >= tournament.number_of_players) {
                return reply.status(400).send({ message: 'Tournament is full.' });
            }

            await dbRun('INSERT INTO tournament_participants (tournament_id, alias) VALUES (?, ?)', [tournamentId, alias]);
            const newParticipant = await dbGet('SELECT * FROM tournament_participants WHERE tournament_id = ? AND alias = ?', [tournamentId, alias]);

            reply.status(201).send(newParticipant);
        } catch (error: any) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                return reply.status(409).send({ message: 'This alias is already taken for this tournament.' });
            }
            fastify.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    // Start a tournament
    fastify.post('/api/tournaments/:id/start', authOpts, async (request: any, reply: FastifyReply) => {
        const tournamentId = parseInt(request.params.id, 10);
        const userId = request.user.id;

        try {
            const tournament = await dbGet('SELECT * FROM tournaments WHERE id = ?', [tournamentId]);
            if (!tournament) return reply.status(404).send({ message: 'Tournament not found.' });
            if (tournament.creator_id !== userId) return reply.status(403).send({ message: 'Only the creator can start the tournament.' });
            if (tournament.status !== 'pending') return reply.status(400).send({ message: 'Tournament has already started or is completed.' });

            const participants = await dbAll('SELECT * FROM tournament_participants WHERE tournament_id = ?', [tournamentId]);
            if (participants.length !== tournament.number_of_players) {
                return reply.status(400).send({ message: `Waiting for ${tournament.number_of_players - participants.length} more players.` });
            }

            // --- Create Bracket (Single Elimination) ---
            // Shuffle participants for random pairings
            for (let i = participants.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [participants[i], participants[j]] = [participants[j], participants[i]];
            }

            // Create first-round matches
            for (let i = 0; i < participants.length; i += 2) {
                const player1 = participants[i];
                const player2 = participants[i + 1];
                await dbRun(
                    'INSERT INTO matches (tournament_id, round, match_in_round, player1_id, player2_id) VALUES (?, ?, ?, ?, ?)',
                    [tournamentId, 1, i / 2 + 1, player1.id, player2.id]
                );
            }

            await dbRun('UPDATE tournaments SET status = \'active\' WHERE id = ?', [tournamentId]);
            reply.send({ message: 'Tournament started!' });

        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    // Get tournament details
    fastify.get('/api/tournaments/:id', authOpts, async (request: any, reply: FastifyReply) => {
        const tournamentId = parseInt(request.params.id, 10);
        try {
            const tournament = await dbGet('SELECT * FROM tournaments WHERE id = ?', [tournamentId]);
            if (!tournament) return reply.status(404).send({ message: 'Tournament not found.' });

            const participants = await dbAll('SELECT id, alias FROM tournament_participants WHERE tournament_id = ?', [tournamentId]);
            
            const matches = await dbAll(`
                SELECT 
                    m.id, m.round, m.match_in_round, m.status,
                    p1.alias as player1_alias, p1.id as player1_id,
                    p2.alias as player2_alias, p2.id as player2_id,
                    w.alias as winner_alias, w.id as winner_id
                FROM matches m
                LEFT JOIN tournament_participants p1 ON m.player1_id = p1.id
                LEFT JOIN tournament_participants p2 ON m.player2_id = p2.id
                LEFT JOIN tournament_participants w ON m.winner_id = w.id
                WHERE m.tournament_id = ?
                ORDER BY m.round, m.match_in_round
            `, [tournamentId]);

            reply.send({ ...tournament, participants, matches });
        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    // Report match winner
    fastify.post('/api/matches/:matchId/winner', authOpts, async (request: any, reply: FastifyReply) => {
        const matchId = parseInt(request.params.matchId, 10);
        const { winnerId } = request.body as { winnerId: number };
        const userId = request.user.id;

        try {
            const match = await dbGet('SELECT * FROM matches WHERE id = ?', [matchId]);
            if (!match) return reply.status(404).send({ message: 'Match not found.' });

            const tournament = await dbGet('SELECT creator_id FROM tournaments WHERE id = ?', [match.tournament_id]);
            if (tournament.creator_id !== userId) return reply.status(403).send({ message: 'Only the creator can report results.' });
            if (match.status !== 'pending') return reply.status(400).send({ message: 'Match result already reported.' });
            if (winnerId !== match.player1_id && winnerId !== match.player2_id) return reply.status(400).send({ message: 'Winner is not a participant in this match.' });

            await dbRun('UPDATE matches SET winner_id = ?, status = \'completed\' WHERE id = ?', [winnerId, matchId]);

            // --- Advance Bracket Logic ---
            const completedRoundMatches = await dbAll('SELECT winner_id FROM matches WHERE tournament_id = ? AND round = ? AND status = \'completed\'', [match.tournament_id, match.round]);
            const totalRoundMatches = await dbAll('SELECT id FROM matches WHERE tournament_id = ? AND round = ?', [match.tournament_id, match.round]);

            if (completedRoundMatches.length === totalRoundMatches.length) {
                // Round is complete, create next round
                const winners = completedRoundMatches.map(m => m.winner_id);
                if (winners.length > 1) {
                    for (let i = 0; i < winners.length; i += 2) {
                        await dbRun(
                            'INSERT INTO matches (tournament_id, round, match_in_round, player1_id, player2_id) VALUES (?, ?, ?, ?, ?)',
                            [match.tournament_id, match.round + 1, i / 2 + 1, winners[i], winners[i + 1]]
                        );
                    }
                } else {
                    // This was the final match, tournament is over
                    await dbRun('UPDATE tournaments SET status = \'completed\' WHERE id = ?', [match.tournament_id]);
                }
            }

            reply.send({ message: 'Match result recorded.' });
        } catch (error) {
            fastify.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });
}
