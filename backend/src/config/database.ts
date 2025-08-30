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
        `, (err) => {
            if (err) {
                console.error('Error creating users table:', err.message);
                return reject(err);
            }
            console.log('Users table checked/created.');
            resolve();
        });
    });
};

export default databaseConnection;
