import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    // Mock Clients Data with more complete information
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
        spouse: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '(555) 123-9876',
          dateOfBirth: '1977-08-20',
          gender: 'Female',
          employerName: 'Education First Academy'
        },
        children: [
          { name: 'Michael Smith', dateOfBirth: '2010-03-12' },
          { name: 'Emily Smith', dateOfBirth: '2012-07-25' }
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
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '(555) 987-6543',
        address: '456 Oak St, Somewhere, NY 10001',
        dateOfBirth: '1982-11-23',
        gender: 'Female',
        maritalStatus: 'single',
        status: 'active',
        hasAccess: true,
        advisorId: '3',
        createdAt: '2023-03-10',
        nextReviewDate: '2024-03-20',
        employerName: 'Financial Services LLC',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
        children: [
          { name: 'Thomas Johnson', dateOfBirth: '2015-05-18' }
        ],
        financialProfile: {
          income: {
            salary: 120000,
            bonuses: 15000,
            investmentIncome: 8000,
            rentalIncome: 0,
            otherIncome: 2000
          },
          assets: {
            realEstate: {
              primaryResidence: 650000
            },
            retirement: {
              retirementAccount401k: 280000,
              ira: 85000,
              rothIra: 65000
            },
            investments: {
              stocks: 120000,
              bonds: 50000,
              mutualFunds: 80000
            },
            banking: {
              checking: 15000,
              savings: 45000,
              emergencyFund: 30000
            }
          },
          liabilities: {
            mortgage: {
              primaryResidence: 420000
            },
            loans: {
              auto: 28000,
              student: 65000,
              personal: 12000
            },
            creditCards: 5000
          }
        }
      },
      {
        id: '4',
        name: 'John Smith',
        email: 'client@prosperityfin.com',
        phone: '(555) 123-4567',
        address: '123 Main St, Anytown, CA 94105',
        dateOfBirth: '1975-06-15',
        gender: 'Male',
        maritalStatus: 'married',
        status: 'active',
        hasAccess: true,
        advisorId: '3',
        createdAt: '2023-01-15',
        nextReviewDate: '2024-07-15',
        employerName: 'Tech Innovations Inc.',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        spouse: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '(555) 123-9876',
          dateOfBirth: '1977-08-20',
          gender: 'Female',
          employerName: 'Education First Academy'
        },
        children: [
          { name: 'Michael Smith', dateOfBirth: '2010-03-12' },
          { name: 'Emily Smith', dateOfBirth: '2012-07-25' }
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
      }
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
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'manager@prosperityfin.com',
        role: 'manager',
        teamId: 'team-1',
        status: 'active',
        createdAt: '2023-01-05',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face'
      },
      {
        id: '3',
        name: 'Michael Chen',
        email: 'advisor@prosperityfin.com',
        role: 'financial_professional',
        teamId: 'team-1',
        status: 'active',
        createdAt: '2023-01-10',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      },
      {
        id: '4',
        name: 'John Smith',
        email: 'client@prosperityfin.com',
        role: 'client',
        status: 'active',
        createdAt: '2023-01-15',
        advisorId: '3',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
      }
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
      {
        id: '2',
        title: 'College Funding Plan',
        description: 'Strategic plan for funding children\'s education with tax-advantaged growth potential.',
        clientId: '2',
        advisorId: '3',
        status: 'sent',
        createdAt: '2024-01-15',
        strategy: 'infinite_banking',
        productType: 'whole_life',
        carrier: 'mutual_omaha'
      },
      {
        id: '3',
        title: 'Retirement & Estate Planning Strategy',
        description: 'Comprehensive financial strategy focused on wealth building, retirement income and tax-efficient estate transfer.',
        clientId: '4',
        advisorId: '3',
        status: 'approved',
        createdAt: '2024-01-05',
        strategy: 'lirp',
        productType: 'whole_life',
        carrier: 'ameritas',
        initialLumpSum: '75000',
        monthlyContribution: '1500',
        annualCOI: '4200',
        firstYearBonus: '3000',
        yearsToPay: '20',
        averageReturnPercentage: '6.8',
        deathBenefitAmount: '1500000',
        livingBenefits: '750000',
        terminalIllnessBenefit: '375000',
        chronicIllnessBenefit: '300000',
        criticalIllnessBenefit: '300000',
        averageMonthlyCost: '450',
        tenYearIncome: '150000',
        lifetimeIncome: '2200000'
      }
    ];

    setClients(mockClients);
    setUsers(mockUsers);
    setProposals(mockProposals);
    setLoading(false);
  };

  // CRUD operations for clients
  const addClient = (client) => {
    setClients(prev => [...prev, { ...client, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
  };

  const updateClient = (id, updates) => {
    setClients(prev => prev.map(client => client.id === id ? { ...client, ...updates } : client));
  };

  const deleteClient = (id) => {
    setClients(prev => prev.filter(client => client.id !== id));
  };

  // CRUD operations for users
  const addUser = (user) => {
    setUsers(prev => [...prev, { ...user, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
  };

  const updateUser = (id, updates) => {
    setUsers(prev => prev.map(user => user.id === id ? { ...user, ...updates } : user));
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  // CRUD operations for proposals
  const addProposal = (proposal) => {
    setProposals(prev => [...prev, { ...proposal, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
  };

  const updateProposal = (id, updates) => {
    setProposals(prev => prev.map(proposal => proposal.id === id ? { ...proposal, ...updates } : proposal));
  };

  const deleteProposal = (id) => {
    setProposals(prev => prev.filter(proposal => proposal.id !== id));
  };

  const value = {
    clients,
    users,
    proposals,
    loading,
    addClient,
    updateClient,
    deleteClient,
    addUser,
    updateUser,
    deleteUser,
    addProposal,
    updateProposal,
    deleteProposal
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataProvider;