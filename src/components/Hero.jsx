import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative h-screen bg-gray-900 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      ></div>

      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Build Your Dream PC
        </h1>
        <p className="text-lg md:text-2xl mb-8 max-w-xl">
          Customize every part, check compatibility, and get the best
          performance.
        </p>
        <Link
          to="/builder"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition"
        >
          Start Building
        </Link>
      </div>
    </div>
  );
};

export default Hero;
