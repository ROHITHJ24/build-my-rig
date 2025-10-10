import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import BuildSummary from "../components/BuildSummary";
import Footer from "../components/Footer";
import { Moon, Sun } from "lucide-react";

function Builder({ isLoggedIn }) {
  const [products, setProducts] = useState([]);
  const [selectedParts, setSelectedParts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("CPU");
  const [darkMode, setDarkMode] = useState(false);

  const categories = [
    "Motherboard",
    "CPU",
    "RAM",
    "SSD",
    "Hard Disk",
    "Graphics Card",
    "Power Supply",
    "Cabinet",
  ];

  // Fetch products from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  const handleSelectPart = (category, part) => {
    setSelectedParts((prev) => ({ ...prev, [category]: part }));
  };

  // Filter products by selected category
  const filteredProducts = products.filter(
    (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <div className={`${darkMode ? "dark" : ""} transition-colors duration-300`}>
      {/* Header */}
      {/* <header className="flex justify-between items-center px-8 py-4 bg-white dark:bg-gray-800 shadow">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Build Your PC
        </h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {darkMode ? (
            <Sun className="text-yellow-400" />
          ) : (
            <Moon className="text-gray-700" />
          )}
        </button>
      </header> */}

      <section className="flex min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white transition-colors">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
            Components
          </h2>
          <div className="flex flex-col space-y-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`p-3 rounded-xl text-left font-medium border transition-all
                  ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white border-blue-700"
                      : "bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-gray-600"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
              {selectedCategory} Options
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Select your preferred {selectedCategory.toLowerCase()} from the list below.
            </p>

            {/* Product Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 col-span-3">
                  Loading or no products found in {selectedCategory}.
                </p>
              ) : (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    selectedPart={selectedParts[product.category]}
                    handleSelectPart={handleSelectPart}
                  />
                ))
              )}
            </div>

            {/* Build Summary */}
            <div className="mt-12">
              <BuildSummary
                selectedParts={selectedParts}
                isLoggedIn={isLoggedIn}
              />
            </div>
          </div>
        </main>
      </section>

      <Footer />
    </div>
  );
}

export default Builder;
