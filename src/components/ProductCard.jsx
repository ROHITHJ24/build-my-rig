import React from "react";

function ProductCard({ product, selectedPart, handleSelectPart }) {
  const isSelected = selectedPart?._id === product._id;

  return (
    <div
      className={`bg-gray-800 dark:bg-gray-700 p-4 rounded-xl shadow-lg hover:shadow-2xl transition cursor-pointer ${
        isSelected ? "ring-2 ring-green-500" : ""
      }`}
      onClick={() => handleSelectPart(product.category, product)}
    >
      <img
        src={product.imageURL}
        alt={product.name}
        className="w-full h-32 object-cover rounded-md mb-3"
      />
      <h3 className="text-lg font-semibold text-white">{product.name}</h3>
      <p className="text-gray-300">${product.price}</p>
      <p className="text-sm text-gray-400">{product.compatibilityInfo}</p>
      <button
        className={`mt-2 w-full py-2 rounded-md font-semibold transition ${
          isSelected
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {isSelected ? "Selected" : "Add to Build"}
      </button>
    </div>
  );
}

export default ProductCard;
