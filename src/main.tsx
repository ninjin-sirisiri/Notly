import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { initI18n } from './lib/i18n';

// Initialize i18n before rendering
initI18n().then(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
