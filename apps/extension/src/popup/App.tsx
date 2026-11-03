import { useEffect, useState } from 'react';
import { deviceAvailable } from '../ui/device.js';
import { setPasswordName } from '../ui/passwordName.js';
import { useVault } from '../ui/hooks.js';
import { RecoveryKeyScreen } from './RecoveryKeyScreen.js';
import { WelcomeScreen } from './WelcomeScreen.js';
import { UnlockScreen } from './UnlockScreen.js';
import { VaultScreen } from './VaultScreen.js';

export function App() {
  const { status } = useVault();
  // Asked with the status, so the setup screen never shows one way and then the other.
  const [canUseDevice, setCanUseDevice] = useState<boolean | null>(null);
  useEffect(() => void deviceAvailable().then(setCanUseDevice), []);
  // A vault just made with the device: its recovery key, shown before anything else.
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);

  // Until the worker answers, an empty page of the popup's own size: nothing
  // drawn that the answer could swap for something else.
  if (!status || canUseDevice === null) return <div className="h-[560px]" />;
  if (status.state !== 'uninitialized') setPasswordName(status.passwordName);
  if (recoveryKey && status.state === 'unlocked') {
    return (
      <RecoveryKeyScreen
        recoveryKey={recoveryKey}
        onDone={() => setRecoveryKey(null)}
        onPrint={() => void chrome.tabs.create({ url: chrome.runtime.getURL('options.html#recovery') })}
      />
    );
  }
  switch (status.state) {
    case 'uninitialized':
      return <WelcomeScreen />;
    case 'locked':
      return <UnlockScreen secret={status.secret} pin={status.pin} device={status.device} keys={status.keys} ask />;
    case 'unlocked':
      return <VaultScreen data={status.data} account={status.account} />;
  }
}
