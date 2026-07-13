import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global localStorage migration: nexova_* to nexova_*
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const keysToMigrate: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nexova_')) {
        keysToMigrate.push(key);
      }
    }
    keysToMigrate.forEach((key) => {
      const newKey = key.replace(/^nexova_/, 'nexova_');
      const val = localStorage.getItem(key);
      if (val !== null) {
        // Only migrate if target does not exist yet to prevent overwriting newer nexova data
        if (localStorage.getItem(newKey) === null) {
          localStorage.setItem(newKey, val);
        }
      }
    });
  }
} catch (e) {
  console.error("Local storage migration failed:", e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
