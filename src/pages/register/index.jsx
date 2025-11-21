import React from 'react';
import RegisterForm from './components/RegisterForm';
import BrandingHeader from '../login/components/BrandingHeader';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <BrandingHeader />
      <div className="mt-8 mx-auto w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-card py-6 px-4 sm:py-8 sm:px-6">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
