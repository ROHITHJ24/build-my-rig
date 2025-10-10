import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-6 mt-0">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-6">
        <p>© {new Date().getFullYear()} BuildMyRig. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white">Twitter</a>
          <a href="#" className="hover:text-white">Discord</a>
          <a href="#" className="hover:text-white">GitHub</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
