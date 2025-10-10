// components/AdminNavbar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Admin';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <div className="text-2xl flex justify-between gap-2 items-center font-bold cursor-pointer" onClick={() => navigate('/admin')}>
     BuildMyRig 
     {/* <p className=' text-xs'>Admin Dashboard</p>git  */}
      </div>

      <ul className="flex space-x-6">
        <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate('/admin')}>
          Home
        </li>
        <li className="cursor-pointer hover:text-gray-300" onClick={() => alert('Manage Users')}>
          Manage Users
        </li>
        <li className="cursor-pointer hover:text-gray-300" onClick={() => alert('Reports')}>
          Reports
        </li>
      </ul>

      {/* Profile / Logout */}
      <div className="flex items-center space-x-4">
        <span>{username}</span>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
