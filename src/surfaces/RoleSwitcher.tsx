import { Building2, House, UserRoundCheck } from 'lucide-react';

export type ProductSurface = 'community' | 'social-worker' | 'resident';

const surfaces = [
  {
    key: 'community',
    label: '社区电脑端',
    route: '/tog/desktop/workbench',
    icon: Building2,
  },
  {
    key: 'social-worker',
    label: '社工手机端',
    route: '/tog/mobile/workbench',
    icon: UserRoundCheck,
  },
  {
    key: 'resident',
    label: '居民端',
    route: '/resident',
    icon: House,
  },
] as const;

export function RoleSwitcher({ activeSurface }: { activeSurface: ProductSurface }) {
  return (
    <header className="surface-switcher">
      <nav className="surface-switcher__panel" aria-label="切换搭把手产品端">
        {surfaces.map(({ key, label, route, icon: Icon }) => (
          <a
            className={`surface-switcher__option${activeSurface === key ? ' is-active' : ''}`}
            key={key}
            href={`#${route}`}
            aria-current={activeSurface === key ? 'page' : undefined}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </header>
  );
}
