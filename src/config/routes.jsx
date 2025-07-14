import React from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import CRMDashboard from '../pages/CRMDashboard';
import ClientCRM from '../pages/ClientCRM';
import ClientManagement from '../pages/ClientManagement';
import ClientDetails from '../pages/ClientDetails';
import FinancialAnalysis from '../pages/FinancialAnalysis';
import ClientFinancialReport from '../pages/ClientFinancialReport';
import ProposalManagement from '../pages/ProposalManagement';
import UserManagement from '../pages/UserManagement';
import ClientPortal from '../pages/ClientPortal';
import ClientFinancialAnalysis from '../pages/ClientFinancialAnalysis';
import ProfileSettings from '../pages/ProfileSettings';
import ProjectionsSettings from '../pages/ProjectionsSettings';

// Define role constants
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  FINANCIAL_PROFESSIONAL: 'financial_professional',
  CLIENT: 'client'
};

// Define routes with their access controls
export const routes = [
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
    requireAuth: true
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
    requireAuth: true
  },
  {
    path: '/crm',
    element: <CRMDashboard />,
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.FINANCIAL_PROFESSIONAL]
  },
  {
    path: '/clients/:clientId/crm',
    element: <ClientCRM />,
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.FINANCIAL_PROFESSIONAL]
  },
  {
    path: '/client-portal',
    element: <ClientPortal />,
    requireAuth: true,
    allowedRoles: [ROLES.CLIENT]
  },
  {
    path: '/client-financial-analysis',
    element: <ClientFinancialAnalysis />,
    requireAuth: true,
    allowedRoles: [ROLES.CLIENT]
  },
  {
    path: '/clients',
    element: <ClientManagement />,
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.FINANCIAL_PROFESSIONAL]
  },
  {
    path: '/clients/:clientId',
    element: <ClientDetails />,
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.FINANCIAL_PROFESSIONAL]
  },
  {
    path: '/financial-analysis',
    element: <FinancialAnalysis />,
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.FINANCIAL_PROFESSIONAL]
  },
  {
    path: '/financial-analysis/:clientId',
    element: <FinancialAnalysis />,
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.FINANCIAL_PROFESSIONAL]
  },
  {
    path: '/clients/:clientId/report',
    element: <ClientFinancialReport />,
    requireAuth: true
  },
  {
    path: '/proposals',
    element: <ProposalManagement />,
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.FINANCIAL_PROFESSIONAL]
  },
  {
    path: '/users',
    element: <UserManagement />,
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN, ROLES.MANAGER]
  },
  {
    path: '/projections-settings',
    element: <ProjectionsSettings />,
    requireAuth: true,
    allowedRoles: [ROLES.ADMIN]
  },
  {
    path: '/profile-settings',
    element: <ProfileSettings />,
    requireAuth: true
  }
];