import { useEffect, useState } from 'react';
import ToGApp from '../../vendor/tog-linkhood/src/App';
import {
  loadAnonymousDemandSignals,
  subscribeToDemandSignals,
} from '../features/resident-agent/demandRepository';
import { syncTogFeedbackFixtures } from './togFeedbackAdapter';

export default function CommunitySurface() {
  const [revision, setRevision] = useState(() => {
    syncTogFeedbackFixtures(loadAnonymousDemandSignals());
    return 0;
  });

  useEffect(
    () =>
      subscribeToDemandSignals(() => {
        const signals = loadAnonymousDemandSignals();
        syncTogFeedbackFixtures(signals);
        setRevision((current) => current + 1);
      }),
    [],
  );

  return (
    <div className="theme-governance-dark min-h-[calc(100svh-48px)] bg-canvas">
      <ToGApp key={revision} />
    </div>
  );
}
