// HelloWorld.tsx
import React from 'react';
import Header from './header/Header';

const Dashboard: React.FC = () => {
  return (
    <div> <Header />
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '2rem'
    }}>
      Welcome to dashboard!
    </div>
    </div>
  );
};

export default Dashboard;
