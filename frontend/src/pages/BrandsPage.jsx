import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { brands } from '../mockData';

const BrandsPage = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <section 
        className="bg-slate-900 py-20 border-b border-slate-800 bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)), url('https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=1600&h=600&fit=crop')`
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Shop by Brand</h1>
          <p className="text-slate-300 text-xl max-w-3xl mx-auto">
            We carry premium aftermarket rubber tracks and undercarriage parts for all major equipment brands
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {brands.map((brand) => (
            <Link key={brand.id} to={`/products?brand=${brand.name}`}>
              <Card className="bg-slate-900 border-slate-800 hover:border-orange-500 transition-all duration-300 hover:scale-105 group">
                <CardContent className="p-8 text-center">
                  <div className="h-32 flex items-center justify-center mb-6">
                    <img src={brand.logo} alt={brand.name} className="max-h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{brand.name}</h3>
                  <p className="text-slate-400 mb-4">View all {brand.name} parts</p>
                  <div className="text-orange-500 font-semibold group-hover:text-orange-400">
                    Browse Products →
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-slate-900 border border-slate-800 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-white mb-4">Premium Aftermarket Parts for All Brands</h2>
          <div className="text-slate-300 space-y-4">
            <p>
              At Rubber Track Wholesale, we specialize in providing high-quality aftermarket rubber tracks and undercarriage parts for all major equipment manufacturers. Our parts meet or exceed OEM specifications while offering significant cost savings.
            </p>
            <p>
              Each rubber track is manufactured with heavy-duty reinforced steel cords, premium rubber compounds, and undergoes rigorous quality control testing. We stand behind every product with our comprehensive warranty program.
            </p>
            <p>
              Whether you operate Bobcat, Kubota, Caterpillar, Case, or any other major brand, we have the right parts in stock and ready to ship from our nationwide warehouse network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandsPage;
