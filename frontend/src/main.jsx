import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RootComponent from './RootComponent.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
)