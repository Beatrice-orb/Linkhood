import { runResidentAgentFallback } from './fallbackEngine';
import type { ResidentAgentMessage, ResidentAgentTurnResult } from './types';

function isResidentAgentTurn(value: unknown): value is ResidentAgentTurnResult {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ResidentAgentTurnResult>;
  return (
    typeof candidate.answerText === 'string' &&
    typeof candidate.status === 'string' &&
    Array.isArray(candidate.sourceRefs)
  );
}

export async function answerResidentQuestion(
  messages: ResidentAgentMessage[],
): Promise<ResidentAgentTurnResult> {
  const remoteEnabled = import.meta.env.VITE_RESIDENT_AGENT_MODE === 'remote';
  if (!remoteEnabled) return runResidentAgentFallback(messages);

  try {
    const response = await fetch('/api/resident-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: '1.0',
        conversationId: 'anonymous-demo-session',
        communityId: 'xihongmen-demo',
        isDemo: true,
        locale: 'zh-CN',
        messages: messages.slice(-8),
      }),
    });
    if (!response.ok) throw new Error(`resident-agent request failed: ${response.status}`);
    const payload: unknown = await response.json();
    if (!isResidentAgentTurn(payload)) throw new Error('resident-agent response was invalid');
    return { ...payload, usedFallback: false };
  } catch {
    return runResidentAgentFallback(messages);
  }
}
