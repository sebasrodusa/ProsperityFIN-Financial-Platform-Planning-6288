import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import { useAuth } from './AuthContext';

const DataContext = createContext();

// Export the custom hook
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching data from Supabase...');
      
      // Fetch clients
      let { data: clientsData, error: clientsError } = await supabase
        .from('clients_pf')
        .select('*');
      
      if (clientsError) throw clientsError;
      
      // Fetch users
      let { data: usersData, error: usersError } = await supabase
        .from('users_pf')
        .select('*');
      
      if (usersError) throw usersError;
      
      // Fetch proposals
      let { data: proposalsData, error: proposalsError } = await supabase
        .from('projections_pf')
        .select('*');
      
      if (proposalsError) throw proposalsError;
      
      console.log('Data fetched successfully:', {
        clients: clientsData.length,
        users: usersData.length,
        proposals: proposalsData.length
      });
      
      setClients(clientsData || []);
      setUsers(usersData || []);
      setProposals(proposalsData || []);
    } catch (err) {
      console.error('Error fetching data from Supabase:', err);
      setError(err.message);
      
      // Initialize with mock data if Supabase fetch fails
      initializeMockData();
    } finally {
      setLoading(false);
    }
  };

  const initializeMockData = () => {
    console.log('Falling back to mock data');
    
    // Mock Clients Data with CRM fields
    const mockClients = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '(555) 123-4567',
        address: '123 Main St, Anytown, CA 94105',
        dateOfBirth: '1975-06-15',
        gender: 'Male',
        maritalStatus: 'married',
        status: 'active',
        hasAccess: true,
        advisorId: '3',
        createdAt: '2023-01-15',
        nextReviewDate: '2024-02-15',
        employerName: 'Tech Innovations Inc.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        // CRM Fields
        crmStatus: 'follow_up_decision',
        lastActivity: '2024-01-10T10:30:00Z',
        crmNotes: [
          {
            id: '1',
            content: 'Initial meeting went well. Client is interested in retirement planning and life insurance. Needs to discuss with spouse.',
            createdAt: '2024-01-05T14:30:00Z',
            type: 'note'
          },
          {
            id: '2',
            content: 'Follow-up call scheduled for next week. Client has questions about whole life vs term life insurance.',
            createdAt: '2024-01-08T09:15:00Z',
            type: 'note'
          }
        ],
        crmTasks: [
          {
            id: '1',
            name: 'Send life insurance comparison document',
            dueDate: '2024-01-15',
            priority: 'high',
            completed: true,
            createdAt: '2024-01-05T14:30:00Z',
            completedAt: '2024-01-12T11:00:00Z'
          },
          {
            id: '2',
            name: 'Schedule follow-up meeting with spouse',
            dueDate: '2024-01-20',
            priority: 'medium',
            completed: false,
            createdAt: '2024-01-08T09:15:00Z'
          }
        ],
        statusHistory: [
          {
            id: '1',
            fromStatus: 'create_proposal',
            toStatus: 'follow_up_decision',
            changedAt: '2024-01-10T10:30:00Z',
            notes: 'Proposal sent, waiting for decision'
          },
          {
            id: '2',
            fromStatus: 'interested_not_ready',
            toStatus: 'create_proposal',
            changedAt: '2024-01-08T15:20:00Z',
            notes: 'Client ready for proposal after spouse discussion'
          },
          {
            id: '3',
            fromStatus: null,
            toStatus: 'interested_not_ready',
            changedAt: '2024-01-05T14:30:00Z',
            notes: 'Initial status set after first meeting'
          }
        ],
        spouse: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '(555) 123-9876',
          dateOfBirth: '1977-08-20',
          gender: 'Female',
          employerName: 'Education First Academy'
        },
        children: [
          {
            name: 'Michael Smith',
            dateOfBirth: '2010-03-12'
          },
          {
            name: 'Emily Smith',
            dateOfBirth: '2012-07-25'
          }
        ],
        financialProfile: {
          income: {
            salary: 175000,
            bonuses: 25000,
            investmentIncome: 15000,
            rentalIncome: 24000,
            otherIncome: 5000
          },
          assets: {
            realEstate: {
              primaryResidence: 850000,
              rentalProperty: 400000
            },
            retirement: {
              retirementAccount401k: 450000,
              ira: 125000,
              rothIra: 75000
            },
            investments: {
              stocks: 200000,
              bonds: 100000,
              mutualFunds: 150000
            },
            banking: {
              checking: 25000,
              savings: 75000,
              emergencyFund: 50000
            }
          },
          liabilities: {
            mortgage: {
              primaryResidence: 550000,
              rentalProperty: 300000
            },
            loans: {
              auto: 35000,
              student: 45000,
              personal: 0
            },
            creditCards: 8000
          }
        }
      },
      // More mock clients...
    ];

    // Mock Users Data - Updated to include the client user
    const mockUsers = [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@prosperityfin.com',
        role: 'admin',
        status: 'active',
        createdAt: '2023-01-01',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      },
      // More mock users...
    ];

    // Mock Proposals Data
    const mockProposals = [
      {
        id: '1',
        title: 'Retirement Planning Strategy',
        description: 'Comprehensive retirement planning projection with focus on income replacement and tax efficiency.',
        clientId: '1',
        advisorId: '3',
        status: 'pending',
        createdAt: '2024-01-10',
        strategy: 'lirp',
        productType: 'whole_life',
        carrier: 'ameritas',
        initialLumpSum: '50000',
        monthlyContribution: '1000',
        annualCOI: '3500',
        firstYearBonus: '2500',
        yearsToPay: '20',
        averageReturnPercentage: '6.5',
        deathBenefitAmount: '1000000',
        livingBenefits: '500000',
        terminalIllnessBenefit: '250000',
        chronicIllnessBenefit: '200000',
        criticalIllnessBenefit: '200000',
        averageMonthlyCost: '350',
        tenYearIncome: '120000',
        lifetimeIncome: '1800000'
      },
      // More mock proposals...
    ];

    setClients(mockClients);
    setUsers(mockUsers);
    setProposals(mockProposals);
  };

  // CRUD operations for clients
  const addClient = async (client) => {
    try {
      console.log('Adding client to state:', client);
      setClients(prev => [...prev, client]);
    } catch (error) {
      console.error('Error adding client to state:', error);
    }
  };

  const updateClient = async (id, updates) => {
    try {
      console.log('Updating client in state:', id, updates);
      setClients(prev => prev.map(client => client.id === id ? { ...client, ...updates } : client));
    } catch (error) {
      console.error('Error updating client in state:', error);
    }
  };

  const deleteClient = async (id) => {
    try {
      console.log('Deleting client from state:', id);
      setClients(prev => prev.filter(client => client.id !== id));
    } catch (error) {
      console.error('Error deleting client from state:', error);
    }
  };

  // CRUD operations for users
  const addUser = async (user) => {
    try {
      console.log('Adding user to state:', user);
      setUsers(prev => [...prev, user]);
    } catch (error) {
      console.error('Error adding user to state:', error);
    }
  };

  const updateUser = async (id, updates) => {
    try {
      console.log('Updating user in state:', id, updates);
      setUsers(prev => prev.map(user => user.id === id ? { ...user, ...updates } : user));
    } catch (error) {
      console.error('Error updating user in state:', error);
    }
  };

  const deleteUser = async (id) => {
    try {
      console.log('Deleting user from state:', id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user from state:', error);
    }
  };

  // CRUD operations for proposals
  const addProposal = async (proposal) => {
    try {
      console.log('Adding proposal to state:', proposal);
      setProposals(prev => [...prev, proposal]);
    } catch (error) {
      console.error('Error adding proposal to state:', error);
    }
  };

  const updateProposal = async (id, updates) => {
    try {
      console.log('Updating proposal in state:', id, updates);
      setProposals(prev => prev.map(proposal => proposal.id === id ? { ...proposal, ...updates } : proposal));
    } catch (error) {
      console.error('Error updating proposal in state:', error);
    }
  };

  const deleteProposal = async (id) => {
    try {
      console.log('Deleting proposal from state:', id);
      setProposals(prev => prev.filter(proposal => proposal.id !== id));
    } catch (error) {
      console.error('Error deleting proposal from state:', error);
    }
  };

  // Refresh data
  const refreshData = async () => {
    await fetchData();
  };

  const value = {
    clients,
    users,
    proposals,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    addUser,
    updateUser,
    deleteUser,
    addProposal,
    updateProposal,
    deleteProposal,
    refreshData
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataProvider;