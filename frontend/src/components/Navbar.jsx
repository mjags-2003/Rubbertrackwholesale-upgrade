import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, Phone, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-slate-200 py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-orange-500" />
              <span>Call: 1-800-RUBBER-TRACK</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-orange-500" />
              <span>quotes@rubbertrackwholesale.com</span>
            </div>
          </div>
          <div className="text-orange-500 font-semibold">
            Free Shipping on Orders Over $500
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                <span className="text-white">Rubber Track</span>
                <span className="text-orange-500">Wholesale</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-slate-200 hover:text-orange-500 transition-colors font-medium">
                Home
              </Link>
              <Link to="/products" className="text-slate-200 hover:text-orange-500 transition-colors font-medium">
                Products
              </Link>
              <Link to="/brands" className="text-slate-200 hover:text-orange-500 transition-colors font-medium">
                Brands
              </Link>
              <Link to="/blog" className="text-slate-200 hover:text-orange-500 transition-colors font-medium">
                Blog
              </Link>
              <Link to="/faqs" className="text-slate-200 hover:text-orange-500 transition-colors font-medium">
                FAQs
              </Link>
              <Link to="/about" className="text-slate-200 hover:text-orange-500 transition-colors font-medium">
                About
              </Link>
              <Link to="/contact" className="text-slate-200 hover:text-orange-500 transition-colors font-medium">
                Contact
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-slate-200 hover:text-orange-500 hover:bg-slate-800"
              >
                <Search className="h-5 w-5" />
              </Button>
              <Link to="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-200 hover:text-orange-500 hover:bg-slate-800 relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    0
                  </span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-slate-200 hover:text-orange-500"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="pb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by track size, part number, or brand..."
                  className="w-full bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-400 pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <Link
                to="/"
                className="block text-slate-200 hover:text-orange-500 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block text-slate-200 hover:text-orange-500 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/brands"
                className="block text-slate-200 hover:text-orange-500 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Brands
              </Link>
              <Link
                to="/about"
                className="block text-slate-200 hover:text-orange-500 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="block text-slate-200 hover:text-orange-500 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
