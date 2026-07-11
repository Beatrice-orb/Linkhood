import { lazy, Suspense, useEffect, useState } from 'react';
import { MonitorCog, RefreshCcw, Smartphone } from 'lucide-react';
import ResidentApp from './App';
import { clearAnonymousDemandSignals } from './features/resident-agent/demandRepository';

const CommunitySurface = lazy(() => import('./integration/CommunitySurface'));

type Surface = 'resident' | 'community';

function readSurface(): Surface {
  return window.location.hash.startsWith('#/community') ? 'community' : 'resident';
}

export default function RootApp() {
  const [surface, setSurface] = useState<Surface>(readSurface);

  useEffect(() => {
    const handleHashChange = () => setSurface(readSurface());
    window.addEventListener('hashchange', handleHashChange);
    if (!window.location.hash) window.location.hash = '#/resident';
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (nextSurface: Surface) => {
    window.location.hash = nextSurface === 'community' ? '#/community' : '#/resident';
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <nav className="sticky top-0 z-[100] flex h-12 items-center justify-between border-b border-hairline bg-surface px-3 shadow-xs sm:px-5">
        <div className="flex items-center gap-2 text-xs font-bold text-ink">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-jade text-white">搭</span>
          <span className="hidden sm:inline">双端演示 · v0.2</span>
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-canvas p-1">
          <button
            type="button"
            onClick={() => navigate('resident')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors ${
              surface === 'resident' ? 'bg-surface text-jade shadow-xs' : 'text-ink-muted'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            居民端
          </button>
          <button
            type="button"
            onClick={() => navigate('community')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors ${
              surface === 'community' ? 'bg-surface text-jade shadow-xs' : 'text-ink-muted'
            }`}
          >
            <MonitorCog className="h-3.5 w-3.5" />
            社区驾驶舱
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            clearAnonymousDemandSignals();
            window.location.hash = '#/resident';
            window.location.reload();
          }}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium text-ink-muted hover:bg-canvas hover:text-ink"
          title="清空本地匿名需求信号"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">重置演示</span>
        </button>
      </nav>

      {surface === 'community' ? (
        <Suspense
          fallback={
            <div className="flex min-h-[calc(100svh-48px)] items-center justify-center bg-[#1F4A3A] text-sm text-[#F5F0EB]">
              正在载入社区驾驶舱…
            </div>
          }
        >
          <CommunitySurface />
        </Suspense>
      ) : (
        <ResidentApp embeddedDemo />
      )}
    </div>
  );
}
