import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ClerkSignIn = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h2 className="text-3xl font-heading font-bold text-gray-900">
            Welcome to ProsperityFIN™
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your financial analysis platform
          </p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-medium"
        >
          <SignIn 
            afterSignInUrl="#/dashboard"
            signUpUrl="#/sign-up"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary-600 hover:bg-primary-700 text-white',
                card: 'shadow-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'border-gray-300 hover:border-gray-400 transition-colors',
                formFieldLabel: 'text-gray-700',
                formFieldInput: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
                footerActionLink: 'text-primary-600 hover:text-primary-700'
              }
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ClerkSignIn;