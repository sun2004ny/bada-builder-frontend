import { StrictMode } from 'react'; 
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
// Import verification utility (available in browser console as window.verifyBackendConnection)
import './utils/verifyConnection.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);