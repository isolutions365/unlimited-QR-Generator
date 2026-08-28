import './utils/sandboxGuard';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import HydrationDiagnostic from './components/HydrationDiagnostic.tsx';
import { I18nProvider } from './utils/i18n.tsx';
import { FirebaseAuthProvider } from './context/FirebaseAuthContext.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <I18nProvider>
          <FirebaseAuthProvider>
            <HydrationDiagnostic>
              <App />
            </HydrationDiagnostic>
          </FirebaseAuthProvider>
        </I18nProvider>
      </ErrorBoundary>
    </StrictMode>
  );
} else {
  console.error('[Root Mounting Error] Failed to find target DOM container with id "root".');
}

