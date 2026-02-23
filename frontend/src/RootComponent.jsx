import { useState } from 'react';
import { SplashScreen } from './Splash.jsx';
import App from './App.jsx';

export default function RootComponent() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && (
        <SplashScreen onComplete={() => setSplashDone(true)} />
      )}
      {splashDone && <App />}
    </>
  );
}