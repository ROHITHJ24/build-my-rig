import React from "react";

const featuresData = [
  {
    title: "Custom PC Building",
    description: "Choose every component freely to build your dream PC.",
    icon: "🖥️",
  },
  {
    title: "Compatibility Check",
    description: "Never worry about incompatible parts again.",
    icon: "✅",
  },
  {
    title: "Real-Time Pricing",
    description: "See the cost update as you add or remove components.",
    icon: "💰",
  },
  {
    title: "Save & Share Builds",
    description: "Share your custom PC with friends or save for later.",
    icon: "📤",
  },
];

const Features = () => {
  return (
    //  <body class="bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-200"></body>
  <section className="bg-gray-200 dark:bg-gray-800 py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-12 text-gray-900 dark:text-gray-100">
          Why Choose Our PC Builder
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featuresData.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="dark:text-white text-xl font-semibold mb-2 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-black dark:text-white">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
