if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  try {
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (!desc || (!desc.set && !desc.writable)) {
      let currentFetch = window.fetch;
      Object.defineProperty(window, 'fetch', {
        get() { return currentFetch; },
        set(fn) { currentFetch = fn; },
        configurable: true,
        enumerable: true
      });
    }
  } catch (e) {
    console.warn('Fetch setter patch warning:', e);
  }
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CartProvider } from './hooks/useCart';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>,
);
