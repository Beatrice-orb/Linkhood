import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import App from '../App';
import ResidentAgentWidget from '../features/resident-agent/ResidentAgentWidget';

export function ResidentWithAgent() {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHost(document.getElementById('smartphone-container'));
  }, []);

  return (
    <>
      <App />
      {host ? createPortal(<ResidentAgentWidget />, host) : null}
    </>
  );
}
