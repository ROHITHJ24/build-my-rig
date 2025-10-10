import React, { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <button
  onClick={() => setDarkMode(!darkMode)}
  className={`px-4 py-2 rounded-lg transition ${
    darkMode
      ? "bg-gray-200 text-gray-800" // If dark mode is active → show Light button
      : "bg-gray-800 text-gray-200" // If light mode is active → show Dark button
  }`}
>
  {darkMode ? "Light Mode" : "Dark Mode"}
</button>

  );
};

export default ThemeToggle;
