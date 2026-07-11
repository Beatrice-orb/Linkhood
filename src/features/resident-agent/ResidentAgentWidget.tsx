import { FormEvent, useEffect, useRef, useState } from 'react';
import { Bot, ChevronDown, Send, Sparkles, X } from 'lucide-react';
import { answerResidentQuestion } from './agentClient';
import { recordAnonymousDemandSignal } from './demandRepository';
import type { ResidentAgentMessage } from './types';

const INITIAL_MESSAGE: ResidentAgentMessage = {
  id: 'assistant-welcome',
  role: 'assistant',
  content:
    '你好，我是社区服务助手。我可以帮你查询社区服务、社区活动和相关咨询电话。当前内容为演示数据，具体信息请以社区正式通知为准。',
  createdAt: '现在',
};

const QUICK_PROMPTS = [
  '社区最近有适合下班后参加的活动吗？',
  '有没有工作日晚上的 AI 入门课？',
];

function createMessageId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}`;
}

export default function ResidentAgentWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ResidentAgentMessage[]>([INITIAL_MESSAGE]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const sendQuestion = async (question: string) => {
    const content = question.trim();
    if (!content || busy) return;

    const userMessage: ResidentAgentMessage = {
      id: createMessageId('user'),
      role: 'user',
      content,
      createdAt: '刚刚',
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft('');
    setBusy(true);

    const result = await answerResidentQuestion(nextMessages);
    if (result.demandCandidate) {
      recordAnonymousDemandSignal({
        candidate: result.demandCandidate,
        messages: nextMessages,
      });
    }

    const assistantMessage: ResidentAgentMessage = {
      id: createMessageId('assistant'),
      role: 'assistant',
      content: result.answerText,
      createdAt: '刚刚',
      sourceRefs: result.sourceRefs,
    };
    setMessages((current) => [...current, assistantMessage]);
    setBusy(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendQuestion(draft);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group absolute right-4 bottom-20 z-[45] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-jade text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="打开社区服务助手"
        title="社区服务助手"
      >
        <Bot className="h-5 w-5 transition-transform group-hover:-rotate-6" />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-amber text-white shadow-xs">
          <Sparkles className="h-2.5 w-2.5" />
        </span>
      </button>
    );
  }

  return (
    <section
      className="absolute inset-0 z-[70] flex flex-col bg-canvas"
      aria-label="社区服务助手"
    >
      <header className="flex items-center justify-between border-b border-hairline bg-surface px-4 pb-3 pt-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-jade-light text-jade">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink">社区服务助手</h2>
            <p className="text-[10px] text-ink-muted">服务查询 · 活动筛选 · 咨询路由</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full p-2 text-ink-muted hover:bg-canvas hover:text-ink"
          aria-label="关闭社区服务助手"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div
        ref={scrollRef}
        className="custom-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        <div className="rounded-xl border border-amber/20 bg-amber-light px-3 py-2 text-[10px] leading-relaxed text-ink-muted">
          请勿输入姓名、电话或门牌号。未解决问题可能形成匿名需求趋势，仅用于演示，不代表正式留言、社区受理或承诺回复。
        </div>

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[84%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed shadow-xs ${
                message.role === 'user'
                  ? 'rounded-br-sm bg-jade text-white'
                  : 'rounded-bl-sm border border-hairline bg-surface text-ink'
              }`}
            >
              <p>{message.content}</p>
              {message.role === 'assistant' && message.sourceRefs?.length ? (
                <p className="mt-2 border-t border-hairline/70 pt-1.5 text-[9px] text-ink-muted">
                  依据：{message.sourceRefs.map((source) => source.label).join('、')} · 核验于{' '}
                  {message.sourceRefs[0].verifiedAt}
                </p>
              ) : null}
            </div>
          </div>
        ))}

        {busy ? (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-hairline bg-surface px-3 py-2.5 text-[11px] text-ink-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-jade" />
              正在查询演示社区资料…
            </div>
          </div>
        ) : null}
      </div>

      {messages.length === 1 ? (
        <div className="space-y-2 px-4 pb-3">
          <p className="text-[10px] font-medium text-ink-muted">试着问：</p>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void sendQuestion(prompt)}
              className="flex w-full items-center justify-between rounded-xl border border-hairline bg-surface px-3 py-2 text-left text-[11px] text-ink transition-colors hover:border-jade/40 hover:bg-jade-light/30"
            >
              <span>{prompt}</span>
              <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-ink-subtle" />
            </button>
          ))}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="border-t border-hairline bg-surface p-3 pb-4">
        <div className="flex items-end gap-2 rounded-2xl border border-hairline bg-canvas p-2 focus-within:border-jade">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void sendQuestion(draft);
              }
            }}
            rows={1}
            maxLength={500}
            placeholder="问问社区服务或活动…"
            className="max-h-24 min-h-8 flex-1 resize-none bg-transparent px-1 py-1.5 text-xs text-ink outline-none placeholder:text-ink-subtle"
          />
          <button
            type="submit"
            disabled={!draft.trim() || busy}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-jade text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="发送问题"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </section>
  );
}
