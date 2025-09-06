import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User as UserIcon, Menu, X } from "lucide-react";
import type { User } from "../types/user";
import logo from "/assets/logo.png";

interface HeaderProps {
  user: User | null;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navLinks = (
    <>
      <Link
        to="/"
        className="hover:text-green-500 transition-all duration-300 px-6 lg:px-6 md:px-2 md:text-sm"
        onClick={() => setIsDrawerOpen(false)}
      >
        Home
      </Link>
      <Link
        to="/farms"
        className="hover:text-green-500 transition-all duration-300 px-6 lg:px-6 md:px-2 md:text-sm"
        onClick={() => setIsDrawerOpen(false)}
      >
        Farms
      </Link>
      <Link
        to="/blog"
        className="hover:text-green-500 transition-all duration-300 px-6 lg:px-6 md:px-2 md:text-sm"
        onClick={() => setIsDrawerOpen(false)}
      >
        Blog
      </Link>
      <Link
        to="/about"
        className="hover:text-green-500 transition-all duration-300 px-6 lg:px-6 md:px-2 md:text-sm"
        onClick={() => setIsDrawerOpen(false)}
      >
        About Us
      </Link>
      <Link
        to="/help"
        className="hover:text-green-500 transition-all duration-300 px-6 lg:px-6 md:px-2 md:text-sm"
        onClick={() => setIsDrawerOpen(false)}
      >
        Help
      </Link>

      {/* Extra links for specific users */}
      {user?.category === "Farmer" && (
        <Link
          to="/OwnerDashboard"
          className="hover:text-green-500 transition-all duration-300 px-6 lg:px-6 md:px-2 md:text-sm"
          onClick={() => setIsDrawerOpen(false)}
        >
          Farm Dashboard
        </Link>
      )}
      {user?.admin && (
        <Link
          to="/admin"
          className="hover:text-green-500 transition-all duration-300 px-6 lg:px-6 md:px-2 md:text-sm"
          onClick={() => setIsDrawerOpen(false)}
        >
          Admin
        </Link>
      )}
    </>
  );

  return (
    <header
      className="bg-[var(--earthy-green)] text-white shadow-md"
      style={{ backgroundColor: "var(--earthy-green)" }}
    >
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        {/* Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src={logo}
            alt="Logo"
            className="w-10 h-10 rounded-full border border-[var(--sandy-beige)]"
          />
          <div className="px-2" />
          <span className="text-xl  md:text-sm font-bold">Hunter's Haven</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex  space-x-6">{navLinks}</nav>

        {/* Right Section (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {!user ? (
            <>
              <Link
                to="/login"
                className="bg-green-500 px-3 py-1 rounded hover:bg-green-400 transition md:px-2 md:text-sm"
              >
                Login
              </Link>
              <div className="px-2" />
              <Link
                to="/register"
                className="border border-white px-3 py-1 rounded hover:bg-[var(--olive-green)] transition md:px-2 md:text-sm"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <div
                className="border border-white px-3 py-1 md:px-1 rounded hover:bg-green-500 transition cursor-pointer"
                onClick={() => navigate("/profile")}
              >
                <UserIcon className="inline mr-2" />

                <p className="text-sm font-semibold inline md:text-xs">
                  {user.first_name} {user.last_name}
                </p>
              </div>
              <div className="px-2" />
              <button
                onClick={onSignOut}
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-500 transition text-sm"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button onClick={() => setIsDrawerOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[var(--earthy-green)] text-white transform transition-transform duration-300 z-50 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-white">
          <span className="text-lg font-bold">Menu</span>
          <button onClick={() => setIsDrawerOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col space-y-4 p-4">
          {navLinks}
          <div className="border-t border-white pt-4">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="block bg-[var(--rusty-orange)] px-3 py-2 rounded hover:bg-[var(--sunset-yellow)] transition"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Login
                </Link>
                <div className="py-2" />
                <Link
                  to="/register"
                  className="block border border-white px-3 py-2 rounded hover:bg-[var(--olive-green)] transition mt-2"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <div
                  className="border border-white px-3 py-2 rounded hover:bg-[var(--olive-green)] transition cursor-pointer"
                  onClick={() => {
                    navigate("/profile");
                    setIsDrawerOpen(false);
                  }}
                >
                  <p className="text-sm font-semibold">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs">{user.email}</p>
                </div>

                {/* Mobile extra links */}
                {user?.category === "Owner" && (
                  <Link
                    to="/farm-dashboard"
                    className="block px-3 py-2 rounded hover:bg-[var(--olive-green)] transition"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    Farm Dashboard
                  </Link>
                )}
                <div className="px-1" />
                <button
                  onClick={() => {
                    onSignOut();
                    setIsDrawerOpen(false);
                  }}
                  className="bg-red-600 px-3 py-2 rounded hover:bg-red-500 transition text-sm mt-2"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Dark Overlay when drawer is open */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40"
          onClick={() => setIsDrawerOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;
