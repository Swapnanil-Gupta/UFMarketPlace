import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Authentication from "./authentication/Authentication";
import Dashboard from "./Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import Sell from "./sell/Sell";
import EmailVerification from "./authentication/OTPVerification";
import OTPVerification from "./authentication/OTPVerification";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Profile from "./profile/Profile";
import Layout from "./Layout";
// import Profile from "./profile/Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Authentication />} />
        <Route path="/login" element={<Authentication />} />
        <Route path="/signup" element={<Authentication />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              //<ProtectedRoute>
                <Dashboard />
              //</ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listing"
            element={
              //<ProtectedRoute>
                <Sell />
              //</ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
