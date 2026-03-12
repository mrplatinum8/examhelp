import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import './index.css'
import App from './App.jsx'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen bg-[#07071a] text-white flex flex-col items-center justify-center p-8 text-center font-sans">
      <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
        <div className="bg-black/40 p-4 rounded-xl text-red-200 text-left overflow-x-auto text-sm font-mono mb-6">
          {error.message}
        </div>
        <pre className="text-left text-xs bg-black/40 p-4 rounded-xl text-gray-400 overflow-x-auto mb-6 max-h-48 scrollbar">
          {error.stack}
        </pre>
        <button onClick={resetErrorBoundary} className="px-6 py-3 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl transition-colors">
          Try again
        </button>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
