import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import './index.css'
import App from './App.jsx'

// Automatically reload when Vite encounters a missing chunk from an app redeployment
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  const lastReload = window.sessionStorage.getItem('vite_preload_reload');
  const now = Date.now();
  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
    window.sessionStorage.setItem('vite_preload_reload', String(now));
    window.location.reload();
  }
});

function ErrorFallback({ error, resetErrorBoundary }) {
  const isChunkError =
    error?.message?.includes('Failed to fetch dynamically imported module') ||
    error?.message?.includes('Importing a module script failed') ||
    error?.name === 'ChunkLoadError';

  const handleRetry = () => {
    if (isChunkError) {
      window.location.reload();
    } else {
      resetErrorBoundary();
    }
  };

  return (
    <div className="min-h-screen bg-[#07071a] text-white flex flex-col items-center justify-center p-8 text-center font-sans">
      <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-red-400 mb-4">
          {isChunkError ? 'App Update Available' : 'Something went wrong'}
        </h2>
        <div className="bg-black/40 p-4 rounded-xl text-red-200 text-left overflow-x-auto text-sm font-mono mb-6">
          {isChunkError
            ? 'A newer version of ExamFocus was deployed. Reloading the page will load the latest version.'
            : error.message}
        </div>
        {!isChunkError && (
          <pre className="text-left text-xs bg-black/40 p-4 rounded-xl text-gray-400 overflow-x-auto mb-6 max-h-48 scrollbar">
            {error.stack}
          </pre>
        )}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Reload Page
          </button>
          {!isChunkError && (
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl transition-colors cursor-pointer"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
