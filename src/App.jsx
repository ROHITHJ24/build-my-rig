import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import AdminNavbar from './components/AdminNavbar'; // <-- added
import UserHome from './pages/UserHome';
import Builder from './pages/Builder';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';

// RequireAuth HOC to protect routes
const RequireAuth = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/" />; // Not logged in
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />; // Role not allowed
  return children;
};

// Wrapper to include Header for authenticated pages
const AuthLayout = ({ children, isAdmin }) => (
  <>
    <Header />
    <div className=""> {/* optional padding for header */}
      {children}
    </div>
  </>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* User Dashboard */}
        <Route
          path="/user"
          element={
            <RequireAuth allowedRoles={['user', 'guest']}>
              <AuthLayout>
                <UserHome />
              </AuthLayout>
            </RequireAuth>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <RequireAuth allowedRoles={['admin']}>
              <AuthLayout isAdmin={true}> {/* <-- pass isAdmin */}
                <AdminDashboard />
              </AuthLayout>
            </RequireAuth>
          }
        />

        {/* Other pages */}
        <Route
          path="/builder"
          element={
            <RequireAuth allowedRoles={['user', 'admin', 'guest']}>
              <AuthLayout>
                <Builder />
              </AuthLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/about"
          element={
            <RequireAuth allowedRoles={['user', 'admin', 'guest']}>
              <AuthLayout>
                <About />
              </AuthLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/contact"
          element={
            <RequireAuth allowedRoles={['user', 'admin', 'guest']}>
              <AuthLayout>
                <Contact />
              </AuthLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/cart"
          element={
            <RequireAuth allowedRoles={['user', 'admin', 'guest']}>
              <AuthLayout>
                <Cart />
              </AuthLayout>
            </RequireAuth>
          }
        />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
