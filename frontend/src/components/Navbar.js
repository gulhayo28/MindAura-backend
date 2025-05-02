import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            Umidnoma
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-600 hover:text-indigo-600">
              Bosh sahifa
            </Link>
            <Link to="/psychologists" className="text-gray-600 hover:text-indigo-600">
              Psixologlar
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-indigo-600">
              Biz haqimizda
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-indigo-600">
              Aloqa
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 