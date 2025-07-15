import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';
import './App.css';

// Get Clerk configuration from environment variables
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const CLERK_FRONTEND_API = import.meta.env.VITE_CLERK_FRONTEND_API;
const CLERK_SIGN_IN_URL = import.meta.env.VITE_CLERK_SIGN_IN_URL;
const CLERK_SIGN_UP_URL = import.meta.env.VITE_CLERK_SIGN_UP_URL;

if (!CLERK_PUBLISHABLE_KEY) {
  console.error("Missing Clerk publishable key");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      frontendApi={CLERK_FRONTEND_API}
      signInUrl={CLERK_SIGN_IN_URL}
      signUpUrl={CLERK_SIGN_UP_URL}
      navigate={(to) => window.location.hash = to.replace('/', '')}
      appearance={{
        variables: {
          colorPrimary: '#0284c7',
          borderRadius: '0.5rem',
        },
        elements: {
          rootBox: 'w-full',
          card: 'w-full',
          formButtonPrimary: 'bg-primary-600 hover:bg-primary-700 text-white'
        }
      }}
    >
      <HashRouter>
        <App />
      </HashRouter>
    </ClerkProvider>
  </React.StrictMode>
);