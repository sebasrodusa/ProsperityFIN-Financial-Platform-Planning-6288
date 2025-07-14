import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import supabase from '../lib/supabase';

const Signup = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h2 className="text-3xl font-heading font-bold text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join ProsperityFIN™ financial analysis platform
          </p>
        </div>

        <div className="mt-8 bg-white p-8 rounded-xl shadow-medium">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary-600 hover:bg-primary-700',
                formFieldInput: 'form-input',
                card: 'bg-transparent shadow-none',
              },
            }}
            redirectUrl="/dashboard"
            afterSignUpUrl="/dashboard"
            afterSignInUrl="/dashboard"
            signInUrl="/sign-in"
            roles={['client']}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;