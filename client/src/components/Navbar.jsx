import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 text-2xl font-bold">
            <Link to="/">BUILD-MY-RIG</Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-blue-400 transition">Home</Link>
            <Link to="/builder" className="hover:text-blue-400 transition">Build PC</Link>
            <Link to="/about" className="hover:text-blue-400 transition">About</Link>
            <Link to="/contact" className="hover:text-blue-400 transition">Contact</Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none"
            >
              {isOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-700 px-2 pt-2 pb-3 space-y-1">
          <Link to="/" className="block px-3 py-2 rounded hover:bg-gray-600 transition">Home</Link>
          <Link to="/builder" className="block px-3 py-2 rounded hover:bg-gray-600 transition">Build PC</Link>
          <Link to="/about" className="block px-3 py-2 rounded hover:bg-gray-600 transition">About</Link>
          <Link to="/contact" className="block px-3 py-2 rounded hover:bg-gray-600 transition">Contact</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
