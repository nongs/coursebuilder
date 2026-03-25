import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@root/App';
import { ToastProvider } from '@components/common/toast';
import '@styles/index.scss';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);
