import { useEffect } from 'react';
import App from './App';
import { DemoProvider } from './demo/DemoStore';
import { useHashRoute } from './demo/navigation';
import { RoleSwitcher, type ProductSurface } from './surfaces/RoleSwitcher';
import { TogDesktopApp } from './tog/TogDesktopApp';
import { TogMobileApp } from './tog/TogMobileApp';
import './surfaces/surfaces.css';
import './demo/demo.css';

const titles: Record<ProductSurface, string> = {
  community: '搭把手 · 社区电脑端',
  'social-worker': '搭把手 · 社工手机端',
  resident: '搭把手 · 居民端',
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
    document.title = titles[resolveSurface(route)];
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
