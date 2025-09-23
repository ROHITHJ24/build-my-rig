import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Builder from './pages/Builder';
import Navbar from './components/NavBar';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      {/* Navbar visible on all pages */}
      <Navbar/>

      {/* Page content */}
      <div className="pt-16"> {/* optional padding to prevent content hiding behind Navbar */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* You can add more routes later */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
