import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // role selection for signup
  const [isLogin, setIsLogin] = useState(true); // toggle login/signup
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // signup success message

  // Auto redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      if (role === 'admin') navigate('/admin');
      else navigate('/user');
    }
  }, [navigate]);

  // Helper to get stored users from localStorage
  const getStoredUsers = () => {
    return JSON.parse(localStorage.getItem('users')) || [];
  };

  const validateForm = () => {
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (password.trim().length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (!isLogin && !role) {
      setError('Please select a role');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    const users = getStoredUsers();

    if (isLogin) {
      // LOGIN
      const matchedUser = users.find(
        (u) => u.username === username && u.password === password
      );
      if (matchedUser) {
        // Successful login
        localStorage.setItem('token', 'dummy-token');
        localStorage.setItem('role', matchedUser.role);
        localStorage.setItem('username', matchedUser.username);
        if (matchedUser.role === 'admin') navigate('/admin');
        else navigate('/user');
      } else {
        setError('Invalid credentials');
      }
    } else {
      // SIGNUP
      const existingUser = users.find((u) => u.username === username);
      if (existingUser) {
        setError('Username already exists');
        return;
      }

      const newUser = { username, password, role };
      const updatedUsers = [...users, newUser];
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setSuccess('Signup successful! Please login.');
      // Switch to login form
      setIsLogin(true);
      setUsername('');
      setPassword('');
      setRole('user');
    }
  };

  const handleSkip = () => {
    localStorage.setItem('token', 'guest-token');
    localStorage.setItem('role', 'user');
    localStorage.setItem('username', 'Guest');
    navigate('/user');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-8">Welcome to PC Builder</h1>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-80">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}

          <input
            type="text"
            placeholder="Username"
            className="p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLogin && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="p-2 border rounded"
              required
            >
              <option value="">Select Role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            {isLogin ? 'Login' : 'Signup'}
          </button>
        </form>

        <p
          className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:underline"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setSuccess('');
          }}
        >
          {isLogin ? "Don't have an account? Signup" : 'Already have an account? Login'}
        </p>

        <button
          onClick={handleSkip}
          className="mt-4 w-full bg-gray-400 text-black p-2 rounded hover:bg-gray-500 transition"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
