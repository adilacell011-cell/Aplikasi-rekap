import {createRoot} from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { IosDialog } from './components/IosDialog';
import { iosConfirm } from './store/dialogStore';
import './index.css';
// @ts-ignore - virtual module
import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA with automatic update handling
const updateSW = registerSW({
  onNeedRefresh() {
    iosConfirm({
      title: 'Versi Baru Tersedia',
      message: 'Perbarui aplikasi sekarang?',
      confirmText: 'Perbarui',
      cancelText: 'Nanti',
      confirmVariant: 'primary',
    }).then((ok) => {
      if (ok) updateSW(true);
    });
  },
  immediate: true
});

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
    <IosDialog />
  </ErrorBoundary>,
);
