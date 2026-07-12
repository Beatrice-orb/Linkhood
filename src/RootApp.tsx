import { lazy, Suspense, useEffect } from 'react';
import { Building2, House } from 'lucide-react';
import { routeTo, useHashRoute } from './demo/navigation';
import App from './App';

const CommunitySurface = lazy(() => import('./integration/CommunitySurface'));

type PreviewSurface = 'resident' | 'community';

function PreviewSwitcher({ surface }: { surface: PreviewSurface }) {
  const options = [
    { id: 'resident' as const, label: '居民端', route: '/resident', icon: House },
    { id: 'community' as const, label: '社区端', route: '/community', icon: Building2 },
  ];

  return (
    <nav
      aria-label="切换居民端与社区端"
      className="fixed left-1/2 top-3 z-[120] flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/70 bg-white/90 p-1 shadow-[0_8px_24px_rgba(23,49,59,0.18)] backdrop-blur-md"
    >
      {options.map(({ id, label, route, icon: Icon }) => {
        const active = surface === id;
        return (
          <button
            key={id}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => routeTo(route)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
              active ? 'bg-[#2F6B5F] text-white' : 'text-[#53635E] hover:bg-[#EEF4F1]'
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

export default function RootApp() {
  const route = useHashRoute();
  const surface: PreviewSurface = route === '/community' ? 'community' : 'resident';

  useEffect(() => {
    if (route !== '/resident' && route !== '/community') routeTo('/resident');
  }, [route]);

  useEffect(() => {
    document.title = surface === 'community'
      ? '搭把手 · 社区运营驾驶舱'
      : '搭把手 · 居民社区生活端';
  }, [surface]);

  return (
    <>
      <PreviewSwitcher surface={surface} />
      {surface === 'community' ? (
        <Suspense
          fallback={(
            <main className="flex h-screen items-center justify-center bg-[#1F4A3A] text-sm font-semibold text-white/75" role="status">
              正在加载社区运营驾驶舱…
            </main>
          )}
        >
          <CommunitySurface />
        </Suspense>
      ) : (
        <App />
      )}
    </>
  );
}
