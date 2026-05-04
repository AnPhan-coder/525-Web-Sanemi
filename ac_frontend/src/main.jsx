import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = "1029280040978-l8p4pfknj46hdb4dl113mjbecsb1gf1j.apps.googleusercontent.com";
createRoot(document.getElementById('root')).render(
  <StrictMode>
      <GoogleOAuthProvider clientId={clientId}>
        <App />
      </GoogleOAuthProvider>
  </StrictMode>,
)
