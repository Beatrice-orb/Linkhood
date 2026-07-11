import { runResidentAgentFallback } from './fallbackEngine';
import type { ResidentAgentMessage, ResidentAgentTurnResult } from './types';

export interface LocalProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  apiStyle: 'responses' | 'chat_completions';
}

export interface LocalProviderStatus {
  localOnly: boolean;
  configured: boolean;
  model?: string;
  baseUrl?: string;
  apiStyle?: 'responses' | 'chat_completions';
}

function isResidentAgentTurn(value: unknown): value is ResidentAgentTurnResult {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ResidentAgentTurnResult>;
  return (
    typeof candidate.answerText === 'string' &&
    ['answered', 'needs_context', 'safety_redirect'].includes(String(candidate.status)) &&
    Array.isArray(candidate.sourceRefs) &&
    candidate.sourceRefs.every(
      (source) =>
        Boolean(source) &&
        typeof source.id === 'string' &&
        typeof source.label === 'string' &&
        typeof source.verifiedAt === 'string' &&
        source.isDemo === true,
    ) &&
    typeof candidate.usedFallback === 'boolean'
  );
}

export function isLocalAgentConfigurationAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

export async function readLocalProviderStatus(): Promise<LocalProviderStatus> {
  if (!isLocalAgentConfigurationAvailable()) return { localOnly: true, configured: false };
  const response = await fetch('/api/resident-agent/session-config');
  if (!response.ok) return { localOnly: true, configured: false };
  return response.json() as Promise<LocalProviderStatus>;
}

export async function configureLocalResidentAgent(
  config: LocalProviderConfig,
): Promise<LocalProviderStatus> {
  if (!isLocalAgentConfigurationAvailable()) {
    throw new Error('本机模型配置只在 localhost 可用');
  }
  const response = await fetch('/api/resident-agent/session-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!response.ok) throw new Error('模型配置未保存，请检查 Base URL 和模型名');
  return response.json() as Promise<LocalProviderStatus>;
}

export async function clearLocalResidentAgent(): Promise<void> {
  if (!isLocalAgentConfigurationAvailable()) return;
  await fetch('/api/resident-agent/session-config', { method: 'DELETE' });
}

export async function answerResidentQuestion(
  messages: ResidentAgentMessage[],
): Promise<ResidentAgentTurnResult> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch('/api/resident-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        schemaVersion: '2.0',
        conversationId: 'local-demo-session',
        communityId: 'xihongmen-demo',
        isDemo: true,
        locale: 'zh-CN',
        messages: messages.slice(-8),
      }),
    });
    if (!response.ok) throw new Error(`resident-agent request failed: ${response.status}`);
    const payload: unknown = await response.json();
    if (!isResidentAgentTurn(payload)) throw new Error('resident-agent response was invalid');
    return payload;
  } catch {
    return runResidentAgentFallback(messages);
  } finally {
    window.clearTimeout(timeout);
  }
}
