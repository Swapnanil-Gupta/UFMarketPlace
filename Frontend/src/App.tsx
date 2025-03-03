import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Authentication from './authentication/Authentication';
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute';
import Sell from './sell/Sell';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Authentication />} />
        <Route path="/login" element={<Authentication />} />
        <Route path="/signup" element={<Authentication />} />
         <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute> 
          }
        /> 
        <Route path="/listing" element={
          <ProtectedRoute>
            <Sell />
          </ProtectedRoute>
          
          } />
      </Routes>
    </Router>
  );
}

export default App;