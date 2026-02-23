import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;