import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import AdminNavbar from './components/AdminNavbar'; // <-- added
import UserHome from './pages/UserHome';
import Builder from './pages/Builder';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Home from './pages/Home';
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
        {/* Home Page - Public */}
        <Route path="/" element={<Home />} />

        {/* Products Page - Public */}
        <Route path="/products" element={<AuthLayout><div className="p-8"><h1 className="text-2xl font-bold">Products Page - Coming Soon</h1></div></AuthLayout>} />
        <Route path="/products/:id" element={<AuthLayout><div className="p-8"><h1 className="text-2xl font-bold">Product Details - Coming Soon</h1></div></AuthLayout>} />

        {/* Dashboard Pages */}
        <Route path="/dashboard" element={<AuthLayout><div className="p-8"><h1 className="text-2xl font-bold">User Dashboard - Coming Soon</h1></div></AuthLayout>} />
        <Route path="/dashboard/profile" element={<AuthLayout><div className="p-8"><h1 className="text-2xl font-bold">Profile - Coming Soon</h1></div></AuthLayout>} />
        <Route path="/dashboard/orders" element={<AuthLayout><div className="p-8"><h1 className="text-2xl font-bold">Orders - Coming Soon</h1></div></AuthLayout>} />
        <Route path="/dashboard/wishlist" element={<AuthLayout><div className="p-8"><h1 className="text-2xl font-bold">Wishlist - Coming Soon</h1></div></AuthLayout>} />
        <Route path="/dashboard/settings" element={<AuthLayout><div className="p-8"><h1 className="text-2xl font-bold">Settings - Coming Soon</h1></div></AuthLayout>} />

        {/* Auth Pages */}
        <Route path="/login" element={<div className="p-8"><h1 className="text-2xl font-bold">Login - Coming Soon</h1></div>} />
        <Route path="/register" element={<div className="p-8"><h1 className="text-2xl font-bold">Register - Coming Soon</h1></div>} />

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
