const TOKEN_PREFIX = 'linkhood:session:';
const tokenCache = new Map<string, string>();

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function login(userId: string) {
  const response = await fetch('/api/auth/demo-login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) throw new ApiError(response.status, 'LOGIN_FAILED', '无法建立演示会话');
  const payload = await response.json() as { token: string };
  tokenCache.set(userId, payload.token);
  try {
    window.localStorage.setItem(`${TOKEN_PREFIX}${userId}`, payload.token);
  } catch {
    // Memory cache still supports the current tab.
  }
  return payload.token;
}

async function tokenFor(userId: string) {
  const cached = tokenCache.get(userId);
  if (cached) return cached;
  try {
    const stored = window.localStorage.getItem(`${TOKEN_PREFIX}${userId}`);
    if (stored) {
      tokenCache.set(userId, stored);
      return stored;
    }
  } catch {
    // Fall through to a fresh demo session.
  }
  return login(userId);
}

export async function apiRequest<T>(userId: string, path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const token = await tokenFor(userId);
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...init.headers,
      authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 401 && retry) {
    tokenCache.delete(userId);
    try {
      window.localStorage.removeItem(`${TOKEN_PREFIX}${userId}`);
    } catch {
      // Ignore storage restrictions.
    }
    await login(userId);
    return apiRequest<T>(userId, path, init, false);
  }
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    throw new ApiError(response.status, String(payload.error || 'REQUEST_FAILED'), String(payload.message || payload.error || '请求失败'));
  }
  return payload as T;
}

export const postJson = <T>(userId: string, path: string, body: unknown) => apiRequest<T>(userId, path, {
  method: 'POST',
  body: JSON.stringify(body),
});

export const putJson = <T>(userId: string, path: string, body: unknown) => apiRequest<T>(userId, path, {
  method: 'PUT',
  body: JSON.stringify(body),
});
