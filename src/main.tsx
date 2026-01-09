import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)

// Dispatch event for prerenderer
if (typeof document !== 'undefined') {
  window.addEventListener('load', () => {
    document.dispatchEvent(new Event('render-complete'))
  })
}
