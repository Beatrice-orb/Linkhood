import { useEffect, useState } from 'react';

export function routeTo(path: string) {
  window.location.hash = path.startsWith('/') ? path : `/${path}`;
}

export function useHashRoute() {
  const readRoute = () => window.location.hash.replace(/^#/, '') || '/resident';
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const handleHashChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return route;
}
