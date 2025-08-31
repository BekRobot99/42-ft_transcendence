import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

const databaseDirectory = path.join(process.cwd(), 'database');
if (!fs.existsSync(databaseDirectory)) {
    fs.mkdirSync(databaseDirectory, { recursive: true });
}

const databaseFilePath = path.join(databaseDirectory, 'transcendence.sqlite');

const databaseConnection = new sqlite3.Database(databaseFilePath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

export const setupDatabase = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        databaseConnection.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT,
                display_name TEXT,
                avatar_path TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                twofa_secret TEXT,
                twofa_enabled INTEGER DEFAULT 0,
                google_id TEXT UNIQUE
            );

            CREATE TABLE IF NOT EXISTS friend_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                requester_id INTEGER NOT NULL,
                addressee_id INTEGER NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(requester_id, addressee_id)
            );

            CREATE TABLE IF NOT EXISTS tournaments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('pending', 'active', 'completed')) DEFAULT 'pending',
                creator_id INTEGER NOT NULL,
                number_of_players INTEGER NOT NULL,
                game_type TEXT NOT NULL CHECK(game_type IN ('2d', '3d')) DEFAULT '2d',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS tournament_participants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tournament_id INTEGER NOT NULL,
                user_id INTEGER, -- Can be NULL for guest players
                alias TEXT NOT NULL,
                FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                UNIQUE(tournament_id, alias)
            );

            CREATE TABLE IF NOT EXISTS matches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tournament_id INTEGER NOT NULL,
                round INTEGER NOT NULL,
                match_in_round INTEGER NOT NULL,
                player1_id INTEGER,
                player2_id INTEGER,
                winner_id INTEGER,
                status TEXT NOT NULL CHECK(status IN ('pending', 'active', 'completed')) DEFAULT 'pending',
                  player1_score INTEGER NOT NULL DEFAULT 0,
                player2_score INTEGER NOT NULL DEFAULT 0,
                played_at TIMESTAMP,
                FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
                FOREIGN KEY (player1_id) REFERENCES tournament_participants(id) ON DELETE SET NULL,
                FOREIGN KEY (player2_id) REFERENCES tournament_participants(id) ON DELETE SET NULL,
                FOREIGN KEY (winner_id) REFERENCES tournament_participants(id) ON DELETE SET NULL
            );
        `, (err) => {
            if (err) {
                console.error('Error creating tables:', err.message);
                return reject(err);
            }
            console.log('Users table checked/created.');
            console.log('Friend requests table checked/created.');
            console.log('Tournament tables checked/created.');
            resolve();
        });
    });
};

export default databaseConnection;