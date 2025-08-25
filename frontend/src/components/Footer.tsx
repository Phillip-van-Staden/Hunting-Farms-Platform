// src/components/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer
      className="bg-[var(--deep-brown)] text-white mt-8"
      style={{ backgroundColor: "var(--deep-brown)" }}
    >
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* About */}
        <div>
          <h3 className="text-lg font-bold mb-2">About Hunter's Haven</h3>
          <p className="text-sm text-[var(--sandy-beige)]">
            Your go-to platform for discovering the best hunting farms in South
            Africa. Browse, compare, and book unforgettable hunting experiences.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold mb-2">Quick Links</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link to="/farms" className="hover:text-[var(--sunset-yellow)]">
                Browse Farms
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-[var(--sunset-yellow)]">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/help" className="hover:text-[var(--sunset-yellow)]">
                Help
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-[var(--sunset-yellow)]">
                Blogs
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-bold mb-2">Contact Us</h3>
          <p className="text-sm">Email: info@huntershaven.co.za</p>
          <p className="text-sm">Phone: +27 12 345 6789</p>
          <div className="flex space-x-3 mt-2">
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-[var(--sky-blue)]"
            >
              🌐
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="hover:text-[var(--sky-blue)]"
            >
              📸
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="hover:text-[var(--sky-blue)]"
            >
              🐦
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="text-center py-3 text-xs text-[var(--light-gray)] border-t border-[var(--charcoal)] mt-4">
        &copy; {new Date().getFullYear()} Hunter's Haven. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
