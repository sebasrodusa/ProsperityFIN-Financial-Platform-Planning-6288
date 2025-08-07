import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock AuthContext to provide a basic auth state
const mockAuthValue = { user: { id: '1', role: 'admin' }, loading: false, isSignedIn: true };
vi.mock('../contexts/AuthContext', () => {
  const React = require('react');
  const AuthContext = React.createContext();
  return {
    AuthProvider: ({ children }) => (
      <AuthContext.Provider value={mockAuthValue}>{children}</AuthContext.Provider>
    ),
    useAuthContext: () => React.useContext(AuthContext),
  };
});

// Mock downstream providers to simple pass-through components
vi.mock('../contexts/CrmContext', () => ({
  CrmProvider: ({ children }) => <>{children}</>,
}));
vi.mock('../contexts/DataContext', () => ({
  DataProvider: ({ children }) => <>{children}</>,
}));
vi.mock('../contexts/FinancialAnalysisContext', () => ({
  FinancialAnalysisProvider: ({ children }) => <>{children}</>,
}));

import App from '../App';

describe('App root rendering', () => {
  it('renders without missing context errors', () => {
    expect(() =>
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )
    ).not.toThrow();
  });
});
