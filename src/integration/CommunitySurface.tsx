import { useEffect, useState } from 'react';
import ToGApp from '../../vendor/tog-linkhood/src/App';
import {
  loadAnonymousDemandSignals,
  subscribeToDemandSignals,
} from '../features/resident-agent/demandRepository';
import type { AnonymousDemandSignalV1 } from '../features/resident-agent/types';
import AnonymousDemandInbox from './AnonymousDemandInbox';
import { syncTogFeedbackFixtures } from './togFeedbackAdapter';

export default function CommunitySurface() {
  const [state, setState] = useState<{ revision: number; signals: AnonymousDemandSignalV1[] }>(() => {
    const signals = loadAnonymousDemandSignals();
    syncTogFeedbackFixtures(signals);
    return { revision: 0, signals };
  });

  useEffect(
    () =>
      subscribeToDemandSignals(() => {
        const signals = loadAnonymousDemandSignals();
        syncTogFeedbackFixtures(signals);
        setState((current) => ({ revision: current.revision + 1, signals }));
      }),
    [],
  );

  return (
    <div className="theme-governance-dark min-h-[calc(100svh-48px)] bg-canvas">
      <ToGApp key={state.revision} />
      <AnonymousDemandInbox signals={state.signals} />
    </div>
  );
}
