import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const CategoryNav = () => {
  const [selectedCategory, setSelectedCategory] = useState('Track Loaders');
  const [selectedBrand, setSelectedBrand] = useState('Bobcat');

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

  const brands = [
    'ASV', 'Barreto', 'Bobcat', 'Boxer', 'Case', 'Caterpillar', 'Dingo', 
    'Ditch Witch', 'GEHL', 'Hitachi', 'Hyundai', 'IHI', 'JCB', 'John Deere',
    'Kobelco', 'Komatsu', 'Kubota', 'Marooka', 'Mustang', 'New Holland',
    'Sany', 'Takeuchi', 'Terex', 'Terramac', 'Toro', 'Vermeer', 
    'Volvo', 'Wacker Neuson', 'Yanmar'
  ];

  // Machine models for each brand (simplified - you can expand this)
  const machineModels = {
    'Bobcat': ['T110', 'T140', 'T180', 'T190', 'T200', 'T250', 'T300', 'T320', 'T550', 'T590', 'T630', 'T650', 'T740', 'T750', 'T770', 'T870'],
    'Kubota': ['SCL1000', 'SVL65-2', 'SVL75', 'SVL75-2', 'SVL75-2C', 'SVL75-3', 'SVL90', 'SVL90-2', 'SVL95', 'SVL95-2', 'SVL95-2S', 'SVL97', 'SVL97-2', 'SVL97-2C'],
    'Caterpillar': ['247B', '257B', '267B', '277B', '287B', '297C', '299C', '299D', '299D2', '299D3'],
    'Case': ['420CT', '440CT', '450CT', '465', 'TR270', 'TR310', 'TR320', 'TV380', 'TV450'],
    'JCB': ['150T', '180T', '190T', '205T', '220T', '260T', '300T', '320T', '330T'],
    'John Deere': ['315D', '317G', '319E', '323E', '325G', '329E', '331G', '333G'],
    'Takeuchi': ['TL6', 'TL8', 'TL10', 'TL12'],
    'ASV': ['RT25', 'RT30', 'RT40', 'RT50', 'RT60', 'RT65', 'RT75', 'RT120', 'VT70'],
    // Add more brands and models as needed
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
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-4 py-3 focus:outline-none focus:border-orange-500"
                >
                  <option value="">Select Model</option>
                  {machineModels[selectedBrand]?.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            </div>

            <Link to={`/products?brand=${selectedBrand}`}>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 rounded-md transition-colors text-lg">
                Search Parts
              </button>
            </Link>
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
