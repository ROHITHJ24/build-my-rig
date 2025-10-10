import React from "react";

const parts = [
  { name: "CPU", icon: "🧠" },
  { name: "GPU", icon: "🎮" },
  { name: "Motherboard", icon: "🔌" },
  { name: "RAM", icon: "📀" },
  { name: "Storage", icon: "💾" },
  { name: "PSU", icon: "⚡" },
  { name: "Cabinet", icon: "🖥️" },
];

function FeaturedParts() {
  return (
    <section className="bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white py-16 px-6 transition-colors duration-300">
 
      <h2 className="text-3xl font-bold text-center mb-8">
        Choose Your Components
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
        {parts.map((part, idx) => (
          <div
            key={idx}
            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 cursor-pointer rounded-2xl shadow-lg p-6 flex flex-col items-center transition-transform hover:scale-105"
          >
            <span className="text-4xl mb-3">{part.icon}</span>
            <h3 className="text-lg font-semibold">{part.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedParts;
