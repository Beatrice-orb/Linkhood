import fs from 'node:fs';
import path from 'node:path';
import { backup } from 'node:sqlite';
import { db } from './db.ts';
import { DATABASE_PATH } from './config.ts';

const backupDir = path.join(path.dirname(DATABASE_PATH), 'backups');
fs.mkdirSync(backupDir, { recursive: true });
const destination = path.join(backupDir, `linkhood-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`);
await backup(db, destination);
console.log(`Database backup created: ${destination}`);
db.close();
