import { randomBytes } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { db, getUser } from './db.ts';
import { addDays } from './utils.ts';

export type UserRole = 'resident' | 'social_worker' | 'community_operator' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  room: string;
  age: number;
  profession: string;
  tags: string[];
  creditScore: number;
  points: number;
  helpCount: number;
  badges: string[];
  communityId: string;
  role: UserRole;
  verified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export function createSession(userId: string) {
  const user = getUser(userId) as AuthUser | null;
  if (!user) return null;
  const token = randomBytes(32).toString('hex');
  const expiresAt = addDays(new Date(), 14);
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt);
  return { token, expiresAt, user };
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authorization = req.header('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'AUTH_REQUIRED', message: '请先登录' });

  const session = db.prepare('SELECT user_id, expires_at FROM sessions WHERE token = ?').get(token) as { user_id: string; expires_at: string } | undefined;
  if (!session || new Date(session.expires_at).getTime() <= Date.now()) {
    if (session) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return res.status(401).json({ error: 'SESSION_EXPIRED', message: '登录已过期' });
  }
  const user = getUser(session.user_id) as AuthUser | null;
  if (!user) return res.status(401).json({ error: 'USER_UNAVAILABLE', message: '账号不可用' });
  req.authUser = user;
  next();
}

export function requireRoles(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.authUser || !roles.includes(req.authUser.role)) {
      return res.status(403).json({ error: 'FORBIDDEN', message: '没有执行该操作的权限' });
    }
    next();
  };
}
