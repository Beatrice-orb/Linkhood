import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  BookOpenText,
  Check,
  ChevronLeft,
  Copy,
  KeyRound,
  Send,
  Settings2,
  Trash2,
  X,
} from 'lucide-react';
import {
  answerResidentQuestion,
  clearLocalResidentAgent,
  configureLocalResidentAgent,
  isLocalAgentConfigurationAvailable,
  readLocalProviderStatus,
  type LocalProviderConfig,
  type LocalProviderStatus,
} from './agentClient';
import {
  BACKUP_DEMO_PROMPTS,
  PRIMARY_DEMO_PROMPTS,
} from './knowledge';
import { recordResidentNeedInsight } from './insightRepository';
import type { ResidentAgentMessage } from './types';
import XiaoDaMascot from './XiaoDaMascot';

const INITIAL_MESSAGE: ResidentAgentMessage = {
  id: 'assistant-welcome',
  role: 'assistant',
  content:
    '你好，我是社区生活助理“小搭”。你可以把生活里真正卡住的事情完整讲给我听，我会结合演示社区资料，帮你理解需求、比较选择，再给出可执行的建议。',
  createdAt: '现在',
  deliveryMode: 'fallback',
};

function createMessageId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}`;
}

function PromptGuide({ onBack }: { onBack: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1200);
  };

  const groups = [
    { title: '主演示｜陪家人学会手机办事', prompts: PRIMARY_DEMO_PROMPTS },
    { title: '备选演示｜低压力认识邻居', prompts: BACKUP_DEMO_PROMPTS },
  ];

  return (
    <div className="absolute inset-0 z-[80] flex flex-col bg-canvas">
      <header className="flex items-center gap-3 border-b border-hairline bg-surface px-4 pb-3 pt-8">
        <button type="button" onClick={onBack} className="rounded-full p-2 text-ink-muted hover:bg-canvas" aria-label="返回对话">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-sm font-bold text-ink">演示提词</h2>
          <p className="text-[10px] text-ink-muted">复制后回到对话，像居民一样自己输入</p>
        </div>
      </header>
      <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
        {groups.map((group) => (
          <section key={group.title} className="rounded-2xl border border-hairline bg-surface p-3.5 shadow-xs">
            <h3 className="text-xs font-bold text-ink">{group.title}</h3>
            <div className="mt-3 space-y-3">
              {group.prompts.map((prompt, index) => {
                const label = `${group.title}-${index}`;
                return (
                  <div key={prompt} className="rounded-xl bg-canvas p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-jade">第 {index + 1} 轮</span>
                      <button
                        type="button"
                        onClick={() => void copy(label, prompt)}
                        className="flex items-center gap-1 text-[10px] font-medium text-ink-muted hover:text-jade"
                      >
                        {copied === label ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copied === label ? '已复制' : '复制'}
                      </button>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-ink">{prompt}</p>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ProviderSettings({
  status,
  onStatus,
  onBack,
}: {
  status: LocalProviderStatus;
  onStatus: (status: LocalProviderStatus) => void;
  onBack: () => void;
}) {
  const [config, setConfig] = useState<LocalProviderConfig>({
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    model: '',
    apiStyle: 'responses',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const next = await configureLocalResidentAgent(config);
      onStatus(next);
      setConfig((current) => ({ ...current, apiKey: '' }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '配置失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[80] flex flex-col bg-canvas">
      <header className="flex items-center gap-3 border-b border-hairline bg-surface px-4 pb-3 pt-8">
        <button type="button" onClick={onBack} className="rounded-full p-2 text-ink-muted hover:bg-canvas" aria-label="返回对话">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-sm font-bold text-ink">本机模型配置</h2>
          <p className="text-[10px] text-ink-muted">只保存在本机服务进程内存，刷新服务即清除</p>
        </div>
      </header>

      <form onSubmit={save} className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
        <div className={`rounded-xl border px-3 py-2 text-[10px] leading-relaxed ${status.configured ? 'border-jade/20 bg-jade-light text-jade' : 'border-amber/20 bg-amber-light text-ink-muted'}`}>
          {status.configured
            ? `已装入 ${status.model ?? '模型'}；下一条消息会尝试调用，失败时自动使用本地知识回退。`
            : '当前使用本地知识回退。配置需要 API Base URL、模型名和新建的 API Key。'}
        </div>

        <label className="block text-[10px] font-semibold text-ink-muted">
          API Base URL
          <input
            value={config.baseUrl}
            onChange={(event) => setConfig((current) => ({ ...current, baseUrl: event.target.value }))}
            className="mt-1.5 w-full rounded-xl border border-hairline bg-surface px-3 py-2.5 text-xs font-normal text-ink outline-none focus:border-jade"
            placeholder="https://api.openai.com/v1"
            required
          />
        </label>

        <label className="block text-[10px] font-semibold text-ink-muted">
          模型名
          <input
            value={config.model}
            onChange={(event) => setConfig((current) => ({ ...current, model: event.target.value }))}
            className="mt-1.5 w-full rounded-xl border border-hairline bg-surface px-3 py-2.5 text-xs font-normal text-ink outline-none focus:border-jade"
            placeholder="例如 gpt-4.1-mini；以提供方文档为准"
            required
          />
        </label>

        <label className="block text-[10px] font-semibold text-ink-muted">
          API 风格
          <select
            value={config.apiStyle}
            onChange={(event) => setConfig((current) => ({ ...current, apiStyle: event.target.value as LocalProviderConfig['apiStyle'] }))}
            className="mt-1.5 w-full rounded-xl border border-hairline bg-surface px-3 py-2.5 text-xs font-normal text-ink outline-none focus:border-jade"
          >
            <option value="responses">Responses API</option>
            <option value="chat_completions">OpenAI-compatible Chat Completions</option>
          </select>
        </label>

        <label className="block text-[10px] font-semibold text-ink-muted">
          API Key
          <input
            type="password"
            autoComplete="off"
            value={config.apiKey}
            onChange={(event) => setConfig((current) => ({ ...current, apiKey: event.target.value }))}
            className="mt-1.5 w-full rounded-xl border border-hairline bg-surface px-3 py-2.5 text-xs font-normal text-ink outline-none focus:border-jade"
            placeholder="仅本次本机服务使用，不写入浏览器存储"
            minLength={12}
            required
          />
        </label>

        {error ? <p className="rounded-lg bg-coral-light px-3 py-2 text-[10px] text-coral">{error}</p> : null}

        <button type="submit" disabled={saving} className="w-full rounded-xl bg-jade py-3 text-xs font-bold text-white disabled:opacity-50">
          {saving ? '正在装入…' : '仅在本机装入模型配置'}
        </button>

        {status.configured ? (
          <button
            type="button"
            onClick={() => {
              void clearLocalResidentAgent().then(() => onStatus({ localOnly: true, configured: false }));
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-hairline bg-surface py-2.5 text-[11px] font-medium text-ink-muted"
          >
            <Trash2 className="h-3.5 w-3.5" /> 清除本机配置
          </button>
        ) : null}

        <p className="text-[9px] leading-relaxed text-ink-subtle">
          安全边界：该入口只在 localhost 出现；Key 不写入 localStorage、文档或 Git。关闭本机服务后配置失效。Preview 使用服务端环境变量，不提供浏览器填 Key。
        </p>
      </form>
    </div>
  );
}

export default function ResidentAgentWidget() {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<'chat' | 'prompts' | 'provider'>('chat');
  const [messages, setMessages] = useState<ResidentAgentMessage[]>([INITIAL_MESSAGE]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [providerStatus, setProviderStatus] = useState<LocalProviderStatus>({ localOnly: true, configured: false });
  const scrollRef = useRef<HTMLDivElement>(null);
  const localConfigurationAvailable = isLocalAgentConfigurationAvailable();

  useEffect(() => {
    if (!localConfigurationAvailable) return;
    void readLocalProviderStatus().then(setProviderStatus);
  }, [localConfigurationAvailable]);

  useEffect(() => {
    if (!open || panel !== 'chat') return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open, panel]);

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
    const turnCount = nextMessages.filter((message) => message.role === 'user').length;
    if (result.insightCandidate) recordResidentNeedInsight(result.insightCandidate, turnCount);

    setMessages((current) => [
      ...current,
      {
        id: createMessageId('assistant'),
        role: 'assistant',
        content: result.answerText,
        createdAt: '刚刚',
        sourceRefs: result.sourceRefs,
        deliveryMode: result.usedFallback ? 'fallback' : 'model',
      },
    ]);
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
        className="group absolute bottom-20 right-4 z-[45] flex h-16 w-16 items-center justify-center rounded-[22px] border-2 border-white/70 bg-[#F5F0EB] shadow-[0_10px_28px_rgba(23,49,59,0.24)] transition-transform hover:-translate-y-1 active:translate-y-0"
        aria-label="打开社区生活助理"
        title="问问小搭"
      >
        <XiaoDaMascot className="h-13 w-13 transition-transform group-hover:rotate-[-4deg]" />
        <span className="absolute -bottom-1 -left-1 rounded-full bg-coral px-1.5 py-0.5 text-[8px] font-black text-white shadow-xs">问我</span>
      </button>
    );
  }

  return (
    <section className="absolute inset-0 z-[70] flex flex-col bg-canvas" aria-label="社区生活助理">
      <header className="flex items-center justify-between border-b border-hairline bg-surface px-4 pb-3 pt-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F5F0EB] shadow-xs">
            <XiaoDaMascot className="h-9 w-9" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink">小搭 · 社区生活助理</h2>
            <p className="text-[10px] text-ink-muted">听懂生活目标，再帮你找办法</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={() => setPanel('prompts')} className="rounded-full p-2 text-ink-muted hover:bg-canvas hover:text-jade" aria-label="查看演示提词" title="演示提词">
            <BookOpenText className="h-4 w-4" />
          </button>
          {localConfigurationAvailable ? (
            <button type="button" onClick={() => setPanel('provider')} className={`rounded-full p-2 hover:bg-canvas ${providerStatus.configured ? 'text-jade' : 'text-ink-muted'}`} aria-label="配置本机模型" title="本机模型配置">
              {providerStatus.configured ? <KeyRound className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
            </button>
          ) : null}
          <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-ink-muted hover:bg-canvas hover:text-ink" aria-label="关闭社区生活助理">
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="custom-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <div className="rounded-xl border border-amber/20 bg-amber-light px-3 py-2 text-[9px] leading-relaxed text-ink-muted">
          演示资料并非实时办事结果。请勿输入身份证、账号、密码或验证码；服务主题只以不含原文的标签进入本地演示趋势。
        </div>

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed shadow-xs ${message.role === 'user' ? 'rounded-br-sm bg-jade text-white' : 'rounded-bl-sm border border-hairline bg-surface text-ink'}`}>
              <p className="whitespace-pre-line">{message.content}</p>
              {message.role === 'assistant' && message.sourceRefs?.length ? (
                <div className="mt-2 border-t border-hairline/70 pt-1.5 text-[9px] text-ink-muted">
                  <p>依据：{message.sourceRefs.map((source) => source.label).join('、')}</p>
                  <p className="mt-0.5">核验于 {message.sourceRefs[0].verifiedAt} · 演示数据</p>
                </div>
              ) : null}
              {message.role === 'assistant' && message.deliveryMode === 'model' ? (
                <p className="mt-1.5 text-[9px] font-semibold text-jade">真实模型生成</p>
              ) : null}
            </div>
          </div>
        ))}

        {busy ? (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-hairline bg-surface px-3 py-2.5 text-[11px] text-ink-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-jade" />
              正在理解你的情况并查找演示资料…
            </div>
          </div>
        ) : null}
      </div>

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
            rows={2}
            maxLength={800}
            placeholder="把事情、时间和你在意的限制都讲给我听…"
            className="max-h-28 min-h-12 flex-1 resize-none bg-transparent px-1 py-1.5 text-xs text-ink outline-none placeholder:text-ink-subtle"
          />
          <button type="submit" disabled={!draft.trim() || busy} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jade text-white disabled:cursor-not-allowed disabled:opacity-40" aria-label="发送问题">
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[9px] text-ink-subtle">Enter 发送 · Shift + Enter 换行 · 右上角可查看演示提词</p>
      </form>

      {panel === 'prompts' ? <PromptGuide onBack={() => setPanel('chat')} /> : null}
      {panel === 'provider' ? (
        <ProviderSettings status={providerStatus} onStatus={setProviderStatus} onBack={() => setPanel('chat')} />
      ) : null}
    </section>
  );
}
