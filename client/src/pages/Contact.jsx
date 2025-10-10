import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Contact({ isLoggedIn }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert("Please login to submit the contact form.");
      navigate("/login");
      return;
    }

    // Here we will later call the backend API
    console.log("Form data to submit:", formData);
    alert("Thank you! Your message has been submitted.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-20 px-6 transition-colors duration-300">
      <div className="max-w-2xl mx-auto">
        {/* Heading */}
        <h1 className="text-4xl font-bold text-center mb-6">Contact Us</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
          Have a question or feedback? Fill out the form below and we’ll get back to you.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md space-y-6"
        >
          {/* Name */}
          <div>
            <label className="block mb-2 font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-900"
              placeholder="Your name"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-900"
              placeholder="Your email"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block mb-2 font-medium">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-900"
              placeholder="Your message"
              rows="5"
              required
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
}

export default Contact;
