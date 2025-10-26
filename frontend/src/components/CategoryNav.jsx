import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Boxes, Cog, Disc3, Circle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const CategoryNav = () => {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedPartType, setSelectedPartType] = useState(''); // 'rollers', 'idlers', 'sprockets', ''
  const [rollerType, setRollerType] = useState('both'); // 'bottom', 'front', 'both'
  const [idlerType, setIdlerType] = useState('both'); // 'front', 'rear', 'both'
  const [selectedTrackSize, setSelectedTrackSize] = useState('');
  const [trackSizeUnit, setTrackSizeUnit] = useState('mm'); // 'mm' or 'inches'
  const [allMachineModels, setAllMachineModels] = useState({}); // All brands and models combined
  const [trackSizes, setTrackSizes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch machine models and track sizes from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch machine models
        const modelsResponse = await axios.get(`${API}/api/machine-models`);
        const models = modelsResponse.data;
        
        // Group all models by brand (regardless of equipment type)
        const allModels = {};
        
        models.forEach(model => {
          if (!allModels[model.brand]) {
            allModels[model.brand] = [];
          }
          allModels[model.brand].push(model.model_name);
        });
        
        // Sort models within each brand
        Object.keys(allModels).forEach(brand => {
          allModels[brand].sort();
        });
        
        setAllMachineModels(allModels);
        
        // Set default brand if available
        const firstBrand = Object.keys(allModels).sort()[0];
        if (firstBrand) {
          setSelectedBrand(firstBrand);
        }
        
        // Fetch track sizes
        const trackSizesResponse = await axios.get(`${API}/api/track-sizes`);
        setTrackSizes(trackSizesResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const productTypes = [
    { 
      name: 'Rubber Tracks', 
      icon: 'https://customer-assets.emergentagent.com/job_tracksplus/artifacts/duk6146m_track.png',
      link: '/products?category=Rubber Tracks'
    },
    { 
      name: 'Sprockets', 
      icon: 'https://customer-assets.emergentagent.com/job_tracksplus/artifacts/zdgzvt3c_all.png',
      link: '/products?category=Sprockets'
    },
    { 
      name: 'Rollers', 
      icon: 'https://customer-assets.emergentagent.com/job_tracksplus/artifacts/zdgzvt3c_all.png',
      link: '/products?category=Rollers'
    },
    { 
      name: 'Idlers', 
      icon: 'https://customer-assets.emergentagent.com/job_tracksplus/artifacts/zdgzvt3c_all.png',
      link: '/products?category=Idlers'
    }
  ];

  // Get all brands
  const allBrands = Object.keys(allMachineModels).sort();
  
  // Get models for selected brand
  const currentModels = selectedBrand ? (allMachineModels[selectedBrand] || []) : [];

  // Build search URL
  const buildSearchUrl = () => {
    let url = '/products?';
    const params = [];
    
    if (selectedBrand) params.push(`brand=${encodeURIComponent(selectedBrand)}`);
    if (selectedModel) params.push(`model=${encodeURIComponent(selectedModel)}`);
    
    // Part type specific parameters
    if (selectedPartType === 'rollers') {
      params.push(`category=Rollers`);
      if (rollerType !== 'both') params.push(`roller_type=${rollerType}`);
    } else if (selectedPartType === 'idlers') {
      params.push(`category=Idlers`);
      if (idlerType !== 'both') params.push(`idler_type=${idlerType}`);
    } else if (selectedPartType === 'sprockets') {
      params.push(`category=Sprockets`);
    }
    
    if (selectedTrackSize) params.push(`track_size=${encodeURIComponent(selectedTrackSize)}`);
    
    return url + params.join('&');
  };

  if (loading) {
    return (
      <section className="py-8 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center text-white py-12">
            <p>Loading machine models...</p>
          </div>
        </div>
      </section>
    );
  }

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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Brand */}
              <div>
                <label className="block text-slate-300 mb-2 font-semibold">Machine Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setSelectedModel(''); // Reset model when brand changes
                  }}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-4 py-3 focus:outline-none focus:border-orange-500"
                >
                  <option value="">Select Brand</option>
                  {allBrands.map(brand => (
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
                  disabled={!selectedBrand}
                >
                  <option value="">Select Model</option>
                  {currentModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Part Type Selection */}
            <div className="mb-6">
              <label className="block text-slate-300 mb-2 font-semibold">Search For (Optional)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Rubber Tracks */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="partType"
                      value="rubber_tracks"
                      checked={selectedPartType === 'rubber_tracks'}
                      onChange={(e) => setSelectedPartType(e.target.value)}
                      className="w-4 h-4 text-orange-500"
                    />
                    <span className="text-white font-semibold">Rubber Tracks</span>
                  </label>
                </div>

                {/* Rollers */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <label className="flex items-center gap-2 mb-3 cursor-pointer">
                    <input
                      type="radio"
                      name="partType"
                      value="rollers"
                      checked={selectedPartType === 'rollers'}
                      onChange={(e) => setSelectedPartType(e.target.value)}
                      className="w-4 h-4 text-orange-500"
                    />
                    <span className="text-white font-semibold">Rollers</span>
                  </label>
                  {selectedPartType === 'rollers' && (
                    <div className="ml-6 space-y-2">
                      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="rollerType"
                          value="bottom"
                          checked={rollerType === 'bottom'}
                          onChange={(e) => setRollerType(e.target.value)}
                          className="w-3 h-3"
                        />
                        Bottom Only
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="rollerType"
                          value="front"
                          checked={rollerType === 'front'}
                          onChange={(e) => setRollerType(e.target.value)}
                          className="w-3 h-3"
                        />
                        Front Only
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="rollerType"
                          value="both"
                          checked={rollerType === 'both'}
                          onChange={(e) => setRollerType(e.target.value)}
                          className="w-3 h-3"
                        />
                        Both
                      </label>
                    </div>
                  )}
                </div>

                {/* Idlers */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <label className="flex items-center gap-2 mb-3 cursor-pointer">
                    <input
                      type="radio"
                      name="partType"
                      value="idlers"
                      checked={selectedPartType === 'idlers'}
                      onChange={(e) => setSelectedPartType(e.target.value)}
                      className="w-4 h-4 text-orange-500"
                    />
                    <span className="text-white font-semibold">Idlers</span>
                  </label>
                  {selectedPartType === 'idlers' && (
                    <div className="ml-6 space-y-2">
                      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="idlerType"
                          value="front"
                          checked={idlerType === 'front'}
                          onChange={(e) => setIdlerType(e.target.value)}
                          className="w-3 h-3"
                        />
                        Front Only
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="idlerType"
                          value="rear"
                          checked={idlerType === 'rear'}
                          onChange={(e) => setIdlerType(e.target.value)}
                          className="w-3 h-3"
                        />
                        Rear Only
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="idlerType"
                          value="both"
                          checked={idlerType === 'both'}
                          onChange={(e) => setIdlerType(e.target.value)}
                          className="w-3 h-3"
                        />
                        Both
                      </label>
                    </div>
                  )}
                </div>

                {/* Sprockets */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="partType"
                      value="sprockets"
                      checked={selectedPartType === 'sprockets'}
                      onChange={(e) => setSelectedPartType(e.target.value)}
                      className="w-4 h-4 text-orange-500"
                    />
                    <span className="text-white font-semibold">Sprockets</span>
                  </label>
                </div>
              </div>
              
              {/* Clear Part Type */}
              {selectedPartType && (
                <button
                  onClick={() => setSelectedPartType('')}
                  className="mt-3 text-sm text-orange-500 hover:text-orange-400"
                >
                  Clear part type filter
                </button>
              )}
            </div>

            {/* Track Size - Only shown when Rubber Tracks is selected */}
            {selectedPartType === 'rubber_tracks' && (
              <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-slate-300 font-semibold">Track Size (Optional)</label>
                <div className="flex gap-1 text-xs">
                  <button
                    onClick={() => setTrackSizeUnit('mm')}
                    className={`px-3 py-1 rounded ${
                      trackSizeUnit === 'mm'
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    }`}
                  >
                    mm
                  </button>
                  <button
                    onClick={() => setTrackSizeUnit('inches')}
                    className={`px-3 py-1 rounded ${
                      trackSizeUnit === 'inches'
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    }`}
                  >
                    in
                  </button>
                </div>
              </div>
              <select
                value={selectedTrackSize}
                onChange={(e) => setSelectedTrackSize(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-4 py-3 focus:outline-none focus:border-orange-500"
              >
                <option value="">Select Track Size</option>
                {trackSizes.slice(0, 50).map(ts => {
                  let displaySize = ts.size;
                  if (trackSizeUnit === 'inches' && ts.width && ts.pitch) {
                    const widthInches = (ts.width / 25.4).toFixed(1);
                    const pitchInches = (ts.pitch / 25.4).toFixed(2);
                    displaySize = `${widthInches}x${pitchInches}x${ts.links} (${ts.size}mm)`;
                  }
                  return (
                    <option key={ts.id} value={ts.size}>{displaySize}</option>
                  );
                })}
                {trackSizes.length > 50 && (
                  <option disabled>... and {trackSizes.length - 50} more</option>
                )}
              </select>
            </div>
            )}

            {/* Search Button */}
            <div className="flex justify-center">
              <Link 
                to={buildSearchUrl()}
                className="w-full md:w-auto"
              >
                <button className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-12 rounded-lg text-lg transition-colors">
                  Search Parts
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CategoryNav;
