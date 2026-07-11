import { useEffect } from 'react';
import App from './App';
import { DemoProvider } from './demo/DemoStore';
import { useHashRoute } from './demo/navigation';
import { RoleSwitcher, type ProductSurface } from './surfaces/RoleSwitcher';
import { TogDesktopApp } from './tog/TogDesktopApp';
import { TogMobileApp } from './tog/TogMobileApp';
import './surfaces/surfaces.css';
import './demo/demo.css';

const surfaceTitles: Record<ProductSurface, string> = {
  community: '搭把手 · 社区电脑端',
  'social-worker': '搭把手 · 社工手机端',
  resident: '搭把手 · 居民端',
};

const routeTitles: Record<string, string> = {
  '/tog/desktop/workbench': '搭把手 · 社区今日工作台',
  '/tog/desktop/services': '搭把手 · 公共服务接入台',
  '/tog/desktop/activities': '搭把手 · 活动运营台',
  '/tog/desktop/records': '搭把手 · 居民服务档案',
  '/tog/desktop/insights': '搭把手 · 需求与反馈',
  '/tog/mobile/workbench': '搭把手 · 社工今日工作台',
  '/tog/mobile/visit': '搭把手 · 走访记录核对',
};

function resolveSurface(route: string): ProductSurface {
  if (route.startsWith('/tog/desktop/')) return 'community';
  if (route.startsWith('/tog/mobile/')) return 'social-worker';
  return 'resident';
}

function ToGSurface({ route, surface }: { route: string; surface: Exclude<ProductSurface, 'resident'> }) {
  return (
    <DemoProvider>
      <div className={`tog-surface tog-surface--${surface}`}>
        {surface === 'community'
          ? <TogDesktopApp route={route} />
          : <TogMobileApp route={route} />}
      </div>
    </DemoProvider>
  );
}

export default function RootApp() {
  const route = useHashRoute();
  const activeSurface = resolveSurface(route);

  useEffect(() => {
    document.title = routeTitles[route] ?? surfaceTitles[resolveSurface(route)];
    window.scrollTo(0, 0);
  }, [route]);

  return (
    <div className={`surface-root surface-root--${activeSurface}`}>
      <RoleSwitcher activeSurface={activeSurface} />
      <div className="surface-stage">
        <div className="surface-view surface-view--resident" hidden={activeSurface !== 'resident'}>
          <App />
        </div>
        {activeSurface !== 'resident' && <ToGSurface route={route} surface={activeSurface} />}
      </div>
    </div>
  );
}
