import { useVault } from '../ui/hooks.js';
import { SetupScreen } from './SetupScreen.js';
import { UnlockScreen } from './UnlockScreen.js';
import { VaultScreen } from './VaultScreen.js';

export function App() {
  const { status } = useVault();
  // Until the worker answers, an empty page of the popup's own size: nothing
  // drawn that the answer could swap for something else.
  if (!status) return <div className="h-[560px]" />;
  switch (status.state) {
    case 'uninitialized':
      return <SetupScreen />;
    case 'locked':
      return <UnlockScreen />;
    case 'unlocked':
      return <VaultScreen data={status.data} />;
  }
}
