import path from 'node:path';

export const ROOT_DIR = path.resolve(import.meta.dirname, '..');
export const DATABASE_PATH = process.env.DATABASE_PATH || path.join(ROOT_DIR, 'data', 'linkhood.sqlite');
export const PORT = Number(process.env.PORT || 3000);
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const ALLOW_DEMO_LOGIN = process.env.ALLOW_DEMO_LOGIN !== 'false';
