import React from "react";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

function About({ isLoggedIn }) {
  return (
    <>
      <section className="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white py-16 px-6 transition-colors duration-300">
        <div className="max-w-5xl mx-auto text-center">
          {/* Heading */}
          <h1 className="text-4xl font-bold mb-6">About BuildMyRig</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            BuildMyRig is your one-stop platform to design and order your dream PC.
            With our interactive builder, you can hand-pick every part — from the CPU
            to the cabinet — and instantly check compatibility. Once your build is
            ready, you can place an order and get your custom rig delivered.
          </p>

          {/* Login Prompt */}
          {!isLoggedIn && (
            <div className="mb-12">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                To start building your PC or place an order, please log in first.
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  to="/login"
                  className="px-6 py-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition"
                >
                  Login with Email
                </Link>
                <button
                  onClick={() => alert("Google Sign-In coming soon!")}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
                >
                  Login with Google
                </button>
              </div>
            </div>
          )}

          {/* Mission + Vision cards */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-200 dark:bg-gray-800 p-8 rounded-2xl shadow-md hover:shadow-lg transition">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-gray-700 dark:text-gray-300">
                To make PC building simple, fun, and stress-free. Whether you’re a
                gamer, creator, or student, we want you to have full control over
                your rig without worrying about part mismatches.
              </p>
            </div>

            <div className="bg-gray-200 dark:bg-gray-800 p-8 rounded-2xl shadow-md hover:shadow-lg transition">
              <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
              <p className="text-gray-700 dark:text-gray-300">
                To redefine PC shopping — moving away from fixed pre-built machines
                to fully customizable rigs that match every user’s style, budget,
                and performance needs.
              </p>
            </div>
          </div>

          {/* Why BuildMyRig */}
          <div className="mt-16 bg-gray-200 dark:bg-gray-800 p-8 rounded-2xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Why BuildMyRig?</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Unlike traditional online stores, BuildMyRig gives you complete freedom
              to choose your parts, validate them for compatibility, and then
              place an order for your exact build. No compromises, no confusion — 
              just your personalized PC delivered to your doorstep.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default About;
