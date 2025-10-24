import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Package, Cog, Circle, Wrench } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { machineModels, excavatorModels } from '../data/machineModels';

const CategoryNav = () => {
  const [selectedCategory, setSelectedCategory] = useState('Track Loaders');
  const [selectedBrand, setSelectedBrand] = useState('Bobcat');
  const [selectedModel, setSelectedModel] = useState('');

  const categories = [
    { id: 'track-loaders', name: 'Track Loaders', icon: '🚜' },
    { id: 'mini-excavators', name: 'Mini Excavators', icon: '⚙️' }
  ];

  const productTypes = [
    { 
      name: 'Rubber Tracks', 
      icon: 'https://customer-assets.emergentagent.com/job_5a213ce3-2aa7-426d-a6c4-f19be54712e0/artifacts/u7zm7846_image.png',
      link: '/products?category=Rubber Tracks'
    },
    { 
      name: 'Sprockets', 
      icon: 'https://customer-assets.emergentagent.com/job_5a213ce3-2aa7-426d-a6c4-f19be54712e0/artifacts/o3gpqgne_image.png',
      link: '/products?category=Sprockets'
    },
    { 
      name: 'Rollers', 
      icon: 'https://customer-assets.emergentagent.com/job_5a213ce3-2aa7-426d-a6c4-f19be54712e0/artifacts/134ihz8i_image.png',
      link: '/products?category=Rollers'
    },
    { 
      name: 'Idlers', 
      icon: 'https://customer-assets.emergentagent.com/job_5a213ce3-2aa7-426d-a6c4-f19be54712e0/artifacts/134ihz8i_image.png',
      link: '/products?category=Idlers'
    }
  ];

  // Get all brands from both machine models and excavator models
  const trackLoaderBrands = Object.keys(machineModels).sort();
  const excavatorBrands = Object.keys(excavatorModels).sort();
  
  // Combine and remove duplicates
  const allBrands = [...new Set([...trackLoaderBrands, ...excavatorBrands])].sort();
  
  // Add Baumalight to the list if not present
  const brands = allBrands.includes('Baumalight') ? allBrands : [...allBrands, 'Baumalight'].sort();
  
  // Get models based on selected category
  const getCurrentModels = () => {
    if (selectedCategory === 'Mini Excavators') {
      return excavatorModels[selectedBrand] || [];
    }
    return machineModels[selectedBrand] || [];
  };

  return (
    <section className="py-8 bg-slate-900">
      <div className="container mx-auto px-4">
        {/* Quick Category Icons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {productTypes.map((type) => (
            <Link key={type.name} to={type.link}>
              <Card className="bg-slate-800 border-slate-700 hover:border-orange-500 transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="h-20 flex items-center justify-center mb-3">
                    <img src={type.icon} alt={type.name} className="max-h-full w-auto opacity-90" />
                  </div>
                  <h3 className="text-white font-semibold text-lg">{type.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Equipment Search Section */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Find Parts By Equipment</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Equipment Type */}
              <div>
                <label className="block text-slate-300 mb-2 font-semibold">Equipment Type</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-4 py-3 focus:outline-none focus:border-orange-500"
                >
                  <option value="Track Loaders">Track Loaders</option>
                  <option value="Mini Excavators">Mini Excavators</option>
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-slate-300 mb-2 font-semibold">Machine Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-4 py-3 focus:outline-none focus:border-orange-500"
                >
                  {brands.sort().map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Machine Model */}
              <div>
                <label className="block text-slate-300 mb-2 font-semibold">Machine Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-4 py-3 focus:outline-none focus:border-orange-500"
                >
                  <option value="">Select Model</option>
                  {getCurrentModels().map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Show category links when model is selected */}
            {selectedModel ? (
              <div className="space-y-3">
                <p className="text-slate-300 text-sm font-semibold">View parts for {selectedBrand} {selectedModel}:</p>
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    to={`/models/${selectedBrand.toLowerCase().replace(/\s+/g, '-')}/${selectedModel.toLowerCase()}#rubber-tracks`}
                    className="bg-slate-700 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-md transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Rubber Tracks
                  </Link>
                  <Link 
                    to={`/models/${selectedBrand.toLowerCase().replace(/\s+/g, '-')}/${selectedModel.toLowerCase()}#sprockets`}
                    className="bg-slate-700 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-md transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <Cog className="h-4 w-4" />
                    Sprockets
                  </Link>
                  <Link 
                    to={`/models/${selectedBrand.toLowerCase().replace(/\s+/g, '-')}/${selectedModel.toLowerCase()}#idlers`}
                    className="bg-slate-700 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-md transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <Circle className="h-4 w-4" />
                    Idlers
                  </Link>
                  <Link 
                    to={`/models/${selectedBrand.toLowerCase().replace(/\s+/g, '-')}/${selectedModel.toLowerCase()}#rollers`}
                    className="bg-slate-700 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-md transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <Wrench className="h-4 w-4" />
                    Rollers
                  </Link>
                </div>
                <Link to={`/models/${selectedBrand.toLowerCase().replace(/\s+/g, '-')}/${selectedModel.toLowerCase()}`}>
                  <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-md transition-colors text-lg">
                    View All Parts
                  </button>
                </Link>
              </div>
            ) : (
              <Link to={`/products?brand=${selectedBrand}`}>
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-md transition-colors text-lg">
                  Search Parts
                </button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* All Brands Grid */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Shop by Brand</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-10 gap-3">
            {brands.sort().map((brand) => (
              <Link key={brand} to={`/products?brand=${brand}`}>
                <div className="bg-slate-800 border border-slate-700 hover:border-orange-500 rounded-md p-3 text-center transition-all duration-300 hover:scale-105">
                  <span className="text-white text-sm font-medium">{brand}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryNav;
