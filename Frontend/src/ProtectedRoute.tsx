import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authService } from './AuthService';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const sessionId = sessionStorage.getItem('sessionId');
        if (sessionId) {
          // Add actual session verification API call here if needed
          setIsAuthenticated(true);
        } else {
          throw new Error('No active session');
        }
      } catch (error) {
        sessionStorage.removeItem('sessionId');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  if (loading) {
    return <div>Loading authentication status...</div>;
  }

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;