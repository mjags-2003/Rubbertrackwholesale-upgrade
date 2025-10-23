import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              <span className="text-white">Rubber Track</span>
              <span className="text-orange-500">Wholesale</span>
            </h3>
            <p className="text-sm mb-4">
              Your trusted source for premium rubber tracks and undercarriage parts for all major heavy machinery brands.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-orange-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-orange-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-orange-500 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="hover:text-orange-500 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/brands" className="hover:text-orange-500 transition-colors">
                  Brands
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-orange-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-orange-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products?category=rubber-tracks" className="hover:text-orange-500 transition-colors">
                  Rubber Tracks
                </Link>
              </li>
              <li>
                <Link to="/products?category=undercarriage-parts" className="hover:text-orange-500 transition-colors">
                  Undercarriage Parts
                </Link>
              </li>
              <li>
                <Link to="/products?category=rollers" className="hover:text-orange-500 transition-colors">
                  Rollers
                </Link>
              </li>
              <li>
                <Link to="/products?category=sprockets" className="hover:text-orange-500 transition-colors">
                  Sprockets
                </Link>
              </li>
              <li>
                <Link to="/products?category=idlers" className="hover:text-orange-500 transition-colors">
                  Idlers
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">1-800-RUBBER-TRACK</p>
                  <p className="text-slate-400">Mon-Fri: 8AM - 6PM EST</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <a href="mailto:quotes@rubbertrackwholesale.com" className="hover:text-orange-500 transition-colors">
                  quotes@rubbertrackwholesale.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <p>Nationwide Shipping from 7 Warehouses</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-8 pt-8 text-sm text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} Rubber Track Wholesale. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
