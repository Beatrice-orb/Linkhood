import fs from 'node:fs';
import { DATABASE_PATH } from './config.ts';

for (const suffix of ['', '-shm', '-wal']) {
  const file = `${DATABASE_PATH}${suffix}`;
  if (fs.existsSync(file)) fs.unlinkSync(file);
}
console.log(`Database removed: ${DATABASE_PATH}`);
