import React from "react";

const steps = [
  { step: "1", title: "Select Parts", desc: "Pick from a wide range of PC components." },
  { step: "2", title: "Validate", desc: "We check compatibility automatically." },
  { step: "3", title: "Save & Share", desc: "Download or share your custom build." },
];

function HowItWorks() {
  return (
    <section className="bg-gray-200 dark:bg-gray-800 dark:text-white py-16 px-6">
      <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition"
          >
            <div className="text-5xl font-bold text-green-400 mb-4">{s.step}</div>
            <h3 className="dark:text-white text-xl font-semibold mb-2">{s.title}</h3>
            <p className="text-gray-400">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;
