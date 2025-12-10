const { pool } = require('./db/index');
const fs = require('fs');
const path = require('path');

async function initDb() {
    try {
        const sqlPath = path.join(__dirname, 'database.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running database schema...');
        await pool.query(sql);
        console.log('Database initialized successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

initDb();
