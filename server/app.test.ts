import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test, { after } from 'node:test';

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'linkhood-test-'));
process.env.DATABASE_PATH = path.join(tempDir, 'test.sqlite');
process.env.ALLOW_DEMO_LOGIN = 'true';

const { createApp } = await import('./app.ts');
const { db } = await import('./db.ts');
const app = createApp();
const server = app.listen(0, '127.0.0.1');
await new Promise<void>((resolve) => server.once('listening', resolve));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('TEST_SERVER_NOT_STARTED');
const baseUrl = `http://127.0.0.1:${address.port}`;

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  db.close();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

async function request(pathname: string, init: RequestInit = {}, token?: string) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers: {
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const body = await response.json();
  return { response, body };
}

async function login(userId: string) {
  const { response, body } = await request('/api/auth/demo-login', { method: 'POST', body: JSON.stringify({ userId }) });
  assert.equal(response.status, 200);
  return body.token as string;
}

test('public service publication and resident signal form a cross-role loop', async () => {
  const staffToken = await login('staff_li');
  const residentToken = await login('user_xiaoya');

  assert.equal((await request('/api/public-services/xhm_sanfu_2026/extract', { method: 'POST', body: '{}' }, staffToken)).response.status, 200);
  for (const field of ['core', 'fee', 'capacity', 'stationHours']) {
    assert.equal((await request(`/api/public-services/xhm_sanfu_2026/review/${field}`, { method: 'POST', body: '{}' }, staffToken)).response.status, 200);
  }
  assert.equal((await request('/api/public-services/xhm_sanfu_2026/publish', { method: 'POST', body: '{}' }, staffToken)).response.status, 200);
  assert.equal((await request('/api/public-services/xhm_sanfu_2026/actions', {
    method: 'POST',
    body: JSON.stringify({ type: 'express_interest' }),
  }, residentToken)).response.status, 201);

  const insights = await request('/api/insights', {}, staffToken);
  assert.equal(insights.response.status, 200);
  assert.equal(insights.body.signals[0].uniqueActors, 1);
});

test('help points are escrowed and only released after requester confirmation', async () => {
  const requesterToken = await login('user_xiaoya');
  const helperToken = await login('user_adong');
  const beforeRequester = (await request('/api/points', {}, requesterToken)).body.user.points as number;
  const beforeHelper = (await request('/api/points', {}, helperToken)).body.user.points as number;

  const created = await request('/api/posts', {
    method: 'POST',
    body: JSON.stringify({ type: 'help', category: '代取', content: '测试代取需求', meetingTime: '今晚', bountyPoints: 5 }),
  }, requesterToken);
  assert.equal(created.response.status, 201);
  assert.equal(created.body.user.points, beforeRequester - 5);
  const postId = created.body.feedItems.find((post: { content: string }) => post.content === '测试代取需求').id as string;

  assert.equal((await request(`/api/help/${postId}/claim`, { method: 'POST', body: '{}' }, helperToken)).response.status, 200);
  assert.equal((await request('/api/points', {}, helperToken)).body.user.points, beforeHelper);

  assert.equal((await request(`/api/help/${postId}/complete`, { method: 'POST', body: '{}' }, requesterToken)).response.status, 200);
  const helperAfter = (await request('/api/points', {}, helperToken)).body.user;
  assert.equal(helperAfter.points, beforeHelper + 5);
  assert.equal(helperAfter.helpCount, 13);
  assert.equal(helperAfter.creditScore, 91);
});

test('conversation membership protects message writes', async () => {
  const xiaoyaToken = await login('user_xiaoya');
  const strangerToken = await login('user_xiaoyu');
  const chats = await request('/api/conversations', {}, xiaoyaToken);
  const conversationId = chats.body.chatSessions[0].id as string;

  const denied = await request(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content: '不应发送成功' }),
  }, strangerToken);
  assert.equal(denied.response.status, 403);
});

test('government workspace persists and publishes core data to the resident app', async () => {
  const adminToken = await login('admin_1');
  const residentToken = await login('user_xiaoya');
  const bootstrap = await request('/api/government/bootstrap', {}, adminToken);
  assert.equal(bootstrap.response.status, 200);

  const activity = {
    id: 'act-government-api-test',
    name: 'G端数据库联调活动',
    time: '2026-07-20 14:00',
    location: '西红门社区服务中心',
    description: '验证G端写入后居民端可见。',
    limit: 30,
    registered: 0,
    signedIn: 0,
    organizer: '西红门社区居委会',
    status: '报名中',
    registrants: [],
  };
  const state = bootstrap.body.state;
  state.activities = [activity, ...state.activities];

  const saved = await request('/api/government/state', {
    method: 'PUT',
    body: JSON.stringify({ state }),
  }, adminToken);
  assert.equal(saved.response.status, 200);

  const reloaded = await request('/api/government/bootstrap', {}, adminToken);
  assert.equal(reloaded.body.state.activities[0].id, activity.id);
  const resident = await request('/api/resident/bootstrap', {}, residentToken);
  assert.ok(resident.body.events.some((item: { id: string }) => item.id === activity.id));
});
