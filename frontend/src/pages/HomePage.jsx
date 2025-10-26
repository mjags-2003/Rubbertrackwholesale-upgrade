import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Truck, Award, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { brands, products, testimonials } from '../mockData';
import CategoryNav from '../components/CategoryNav';
import TrackSizeSearch from '../components/TrackSizeSearch';

const HomePage = () => {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section 
        className="relative h-[600px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1625936182462-b5fc2d0dcc5b?w=1600&h=900&fit=crop')`
        }}
      >
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Premium <span className="text-orange-500">Rubber Tracks</span> for Heavy Machinery
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Wholesale prices on top-quality rubber tracks and undercarriage parts for all major brands. Fast shipping from 7 warehouses nationwide.
            </p>
            
            {/* Temporary Admin Access Button */}
            <div className="mb-6">
              <Link to="/admin/login">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  🔒 Admin Access
                </Button>
              </Link>
            </div>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg p-2 flex gap-2 shadow-2xl">
              <Input
                type="text"
                placeholder="Search by track size, part number, or machine model..."
                className="flex-1 border-0 text-lg focus-visible:ring-0"
              />
              <Button className="bg-orange-500 hover:bg-orange-600 px-8">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <CategoryNav />

      {/* Features */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-slate-800 border-slate-700 hover:border-orange-500 transition-all duration-300">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Free Shipping</h3>
                <p className="text-slate-400">Free shipping on orders over $500 to commercial addresses nationwide</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 hover:border-orange-500 transition-all duration-300">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Premium Quality</h3>
                <p className="text-slate-400">OEM-quality rubber tracks with 1-year warranty on all products</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700 hover:border-orange-500 transition-all duration-300">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Fast Delivery</h3>
                <p className="text-slate-400">Ships same day from one of our 7 strategically located warehouses</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Track Size Search - REPLACES duplicate Shop by Brand */}
      <TrackSizeSearch />

      {/* Featured Products */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">Featured Products</h2>
              <p className="text-slate-400 text-lg">Best-selling rubber tracks and parts</p>
            </div>
            <Link to="/products">
              <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="bg-slate-800 border-slate-700 hover:border-orange-500 transition-all duration-300 group">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.inStock && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        In Stock
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <p className="text-orange-500 text-sm font-semibold mb-2">{product.brand}</p>
                    <h3 className="text-white font-semibold text-lg mb-2">{product.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{product.size}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-white">${product.price.toFixed(2)}</span>
                      <Link to={`/product/${product.id}`}>
                        <Button className="bg-orange-500 hover:bg-orange-600">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">What Our Customers Say</h2>
            <p className="text-slate-400 text-lg">Trusted by contractors and construction companies nationwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-300 mb-4">"{testimonial.text}"</p>
                  <div className="border-t border-slate-700 pt-4">
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-slate-400 text-sm">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20 bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(249, 115, 22, 0.9), rgba(234, 88, 12, 0.9)), url('https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1600&h=600&fit=crop')`
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Need Help Finding the Right Rubber Track, Sprocket, Roller or Idler?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Our expert team is ready to help you find the perfect rubber tracks, sprockets, rollers, idlers and undercarriage parts for your equipment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100 text-lg px-8">
                Contact Us
              </Button>
            </Link>
            <a href="tel:1-800-RUBBER-TRACK">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-orange-600 text-lg px-8">
                Call Now
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
