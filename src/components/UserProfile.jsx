// components/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Get user/admin info from localStorage
    const storedUser = {
      username: localStorage.getItem('username') || 'Guest',
      role: localStorage.getItem('role') || 'guest',
    };
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setUser({ username: 'Guest', role: 'guest' });
    setSidebarOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* User Icon */}
      <div className="relative">
        <div
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white cursor-pointer"
          title={user?.username}
        >
          {user?.username?.charAt(0).toUpperCase()}
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 z-50">
            <p className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
              <strong>{user?.username}</strong> ({user?.role})
            </p>
            <hr />
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => alert('See Profile clicked!')}
            >
              See Profile
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => alert('Settings clicked!')}
            >
              Settings
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-red-500"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default UserProfile;
