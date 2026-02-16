const Database = require('better-sqlite3');
const db = new Database('data.db', { verbose: console.log });

console.log('Creating tables...');

const createTables = `
  CREATE TABLE IF NOT EXISTS Poll (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS Option (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    pollId TEXT NOT NULL,
    voteCount INTEGER DEFAULT 0,
    FOREIGN KEY (pollId) REFERENCES Poll (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS Vote (
    id TEXT PRIMARY KEY,
    pollId TEXT NOT NULL,
    optionId TEXT NOT NULL,
    voterIp TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pollId) REFERENCES Poll (id) ON DELETE CASCADE,
    FOREIGN KEY (optionId) REFERENCES Option (id) ON DELETE CASCADE,
    UNIQUE(pollId, voterIp)
  );
`;

db.exec(createTables);
console.log('Tables created successfully.');
