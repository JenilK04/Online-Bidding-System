import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white px-4 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">

      {/* Logo */}
      <Link
        to="/products"
        className="text-xl sm:text-2xl font-bold archivo-black-regular text-center sm:text-left"
      >
        Online Bidding System
      </Link>

      {/* Links */}
      <div className="flex justify-center sm:justify-end gap-4 mt-3 sm:mt-0">

        <Link to="/products">
          <button className="border border-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
            Products
          </button>
        </Link>

        <Link to="/my-products">
          <button className="border border-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
            My Products
          </button>
        </Link>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 text-sm"
        >
          Logout
        </button>

      </div>
    </nav>
  );
};

export default Navbar;
