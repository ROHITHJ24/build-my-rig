import React from "react";

function BuildSummary({ selectedParts, isLoggedIn }) {
  const totalPrice = Object.values(selectedParts).reduce(
    (sum, part) => sum + (part?.price || 0),
    0
  );

  return (
    <div className="mt-16 bg-gray-200 dark:bg-gray-800 p-8 rounded-2xl shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Your Build Summary</h2>
      {Object.keys(selectedParts).length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">No parts selected yet.</p>
      ) : (
        <ul className="space-y-2">
          {Object.entries(selectedParts).map(([category, part]) => (
            <li key={category} className="flex justify-between">
              <span>{category}</span>
              <span>{part.name} (${part.price})</span>
            </li>
          ))}
          <li className="flex justify-between font-bold mt-4">
            <span>Total:</span>
            <span>${totalPrice}</span>
          </li>
        </ul>
      )}

      <button
        disabled={!isLoggedIn || Object.keys(selectedParts).length === 0}
        className={`mt-6 w-full py-3 rounded-md font-semibold transition ${
          !isLoggedIn || Object.keys(selectedParts).length === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 text-white"
        }`}
        onClick={() =>
          alert(
            isLoggedIn
              ? "Order placed successfully! (API integration coming soon)"
              : "Please log in to place the order."
          )
        }
      >
        Place Order
      </button>
    </div>
  );
}

export default BuildSummary;
