// src/pages/AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      {/* <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">BuildMyRig Admin</h1>
      </header> */}

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md p-4 min-h-screen">
          <nav className="flex flex-col gap-3">
            <Link to="/admin/users" className="hover:bg-blue-100 p-2 rounded">
              Manage Users
            </Link>
            <Link to="/admin/orders" className="hover:bg-blue-100 p-2 rounded">
              Manage Orders
            </Link>
            <Link to="/admin/products" className="hover:bg-blue-100 p-2 rounded">
              Manage Products
            </Link>
            <Link to="/admin/reports" className="hover:bg-blue-100 p-2 rounded">
              Reports
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, Admin!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-bold text-lg">Users</h3>
              <p>Manage all users here.</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-bold text-lg">Orders</h3>
              <p>Track and manage orders.</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-bold text-lg">Products</h3>
              <p>Add, edit, or remove products.</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-bold text-lg">Reports</h3>
              <p>View sales and analytics reports.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
