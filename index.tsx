import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css' // remove or adjust if you don't have this file

const container = document.getElementById('root')
if (!container) {
  throw new Error('Root container not found (expected a <div id="root"> in index.html)')
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
