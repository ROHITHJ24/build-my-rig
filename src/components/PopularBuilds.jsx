import React from "react";

const builds = [
  { name: "Budget Gaming", price: "$800", parts: "Ryzen 5 + RTX 3060" },
  { name: "Workstation Pro", price: "$2000", parts: "i9 + RTX 4090" },
  { name: "Student Build", price: "$600", parts: "i5 + GTX 1660" },
];

function PopularBuilds() {
  return (
    <section className="bg-gray-100 dark:bg-gray-900 text-white py-16 px-6">
      <h2 className="text-black dark:text-white text-3xl font-bold text-center mb-10">Popular Builds</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {builds.map((b, idx) => (
          <div
            key={idx}
            className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:scale-105 transition"
          >
            <h3 className="text-black dark:text-white text-xl font-semibold mb-2">{b.name}</h3>
            <p className="text-green-400 font-bold text-lg">{b.price}</p>
            <p className="text-gray-400 text-sm mt-2">{b.parts}</p>
            <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600">
              View Build
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PopularBuilds;
