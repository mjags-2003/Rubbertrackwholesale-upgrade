import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Phone, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const NotFoundPage = () => {
  const popularCategories = [
    { name: 'Rubber Tracks', link: '/products?category=Rubber Tracks', icon: <ShoppingCart className="h-5 w-5" /> },
    { name: 'Sprockets', link: '/products?category=Sprockets', icon: <ShoppingCart className="h-5 w-5" /> },
    { name: 'Idlers', link: '/products?category=Idlers', icon: <ShoppingCart className="h-5 w-5" /> },
    { name: 'Rollers', link: '/products?category=Rollers', icon: <ShoppingCart className="h-5 w-5" /> }
  ];

  const quickLinks = [
    { name: 'Home', link: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'All Products', link: '/products', icon: <Search className="h-5 w-5" /> },
    { name: 'Contact Us', link: '/contact', icon: <Phone className="h-5 w-5" /> },
    { name: 'About Us', link: '/about', icon: <Home className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          {/* 404 Error */}
          <h1 className="text-9xl font-bold text-orange-500 mb-4">404</h1>
          <h2 className="text-4xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-xl text-slate-300 mb-8">
            Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
          </p>

          {/* Search Box */}
          <div className="mb-12">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for rubber tracks, sprockets..."
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-3 pl-12 focus:outline-none focus:border-orange-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      window.location.href = `/products?search=${e.target.value}`;
                    }
                  }}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">Popular Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularCategories.map(cat => (
                <Link key={cat.name} to={cat.link}>
                  <Card className="bg-slate-900 border-slate-800 hover:border-orange-500 transition-all cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="flex justify-center mb-3 text-orange-500">
                        {cat.icon}
                      </div>
                      <h4 className="text-white font-semibold">{cat.name}</h4>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">Quick Links</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickLinks.map(link => (
                <Link key={link.name} to={link.link}>
                  <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2">
                    {link.icon}
                    {link.name}
                  </button>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-white mb-3">Need Help?</h3>
              <p className="text-slate-300 mb-4">
                Our team is ready to help you find the right rubber tracks and parts for your equipment.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/contact">
                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-md transition-colors">
                    Contact Support
                  </button>
                </Link>
                <Link to="/">
                  <button className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-md transition-colors">
                    Go to Homepage
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;