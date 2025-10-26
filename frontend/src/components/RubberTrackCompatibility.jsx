import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Search, X, Check } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const RubberTrackCompatibility = () => {
  const [trackSizes, setTrackSizes] = useState([]);
  const [compatibility, setCompatibility] = useState([]);
  const [groupedSizes, setGroupedSizes] = useState({});
  const [selectedWidth, setSelectedWidth] = useState(null);
  const [selectedTrackSize, setSelectedTrackSize] = useState(null);
  const [compatibleMachines, setCompatibleMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState('mm');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trackSizesRes, compatibilityRes] = await Promise.all([
        axios.get(`${API}/api/track-sizes`),
        axios.get(`${API}/api/compatibility`)
      ]);
      
      setTrackSizes(trackSizesRes.data);
      setCompatibility(compatibilityRes.data);
      
      // Group by width
      const groupedMM = {};
      const groupedInches = {};
      
      trackSizesRes.data.forEach(ts => {
        const widthMM = ts.width;
        if (widthMM) {
          const widthKeyMM = `${parseInt(widthMM)}`;
          if (!groupedMM[widthKeyMM]) groupedMM[widthKeyMM] = [];
          groupedMM[widthKeyMM].push(ts);
          
          const widthInches = Math.round(widthMM / 25.4);
          const widthKeyInches = `${widthInches}`;
          if (!groupedInches[widthKeyInches]) groupedInches[widthKeyInches] = [];
          groupedInches[widthKeyInches].push(ts);
        }
      });
      
      setGroupedSizes({ mm: groupedMM, inches: groupedInches });
      
      const widthsMM = Object.keys(groupedMM).sort((a, b) => parseInt(a) - parseInt(b));
      if (widthsMM.length > 0) setSelectedWidth(widthsMM[0]);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  const handleTrackSizeClick = (trackSize) => {
    setSelectedTrackSize(trackSize);
    // Find compatible machines
    const machines = compatibility.filter(comp => 
      comp.track_sizes.includes(trackSize.size)
    );
    setCompatibleMachines(machines);
  };

  const closeModal = () => {
    setSelectedTrackSize(null);
    setCompatibleMachines([]);
  };

  const convertSize = (trackSize) => {
    if (unit === 'inches') {
      const widthInches = (trackSize.width / 25.4).toFixed(1);
      const pitchInches = (trackSize.pitch / 25.4).toFixed(2);
      return {
        size: `${widthInches}x${pitchInches}x${trackSize.links}`,
        width: widthInches,
        pitch: pitchInches,
        links: trackSize.links,
        originalSize: trackSize.size
      };
    }
    return {
      size: trackSize.size,
      width: trackSize.width,
      pitch: trackSize.pitch,
      links: trackSize.links,
      originalSize: trackSize.size
    };
  };

  // Filter machines by search - more intuitive partial matching
  const filteredMachines = searchQuery
    ? compatibility.filter(comp => {
        const searchLower = searchQuery.toLowerCase().replace(/[\s-]/g, '');
        const makeLower = comp.make.toLowerCase().replace(/[\s-]/g, '');
        const modelLower = comp.model.toLowerCase().replace(/[\s-]/g, '');
        
        // Match if search term is found anywhere in make or model (after removing spaces/dashes)
        return makeLower.includes(searchLower) || 
               modelLower.includes(searchLower) ||
               // Also match original strings for better results
               comp.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
               comp.model.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : [];

  if (loading) {
    return (
      <section className="py-8 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center text-white py-12">
            <p>Loading compatibility chart...</p>
          </div>
        </div>
      </section>
    );
  }

  const currentGroupedSizes = groupedSizes[unit] || {};
  const widths = Object.keys(currentGroupedSizes).sort((a, b) => parseInt(a) - parseInt(b));
  const selectedSizes = selectedWidth ? currentGroupedSizes[selectedWidth] || [] : [];

  return (
    <section className="py-12 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">Rubber Track Compatibility Chart</h2>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto mb-6">
            Find which track sizes fit your machine. Browse by width or search for your specific model.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by machine (e.g., T190, SVL75, Bobcat, Kubota)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border-2 border-slate-700 text-white rounded-lg pl-12 pr-4 py-4 focus:outline-none focus:border-orange-500 text-lg"
              />
            </div>
            
            {/* Search Results */}
            {searchQuery && filteredMachines.length > 0 && (
              <div className="mt-4 bg-slate-800 border-2 border-orange-500 rounded-lg max-h-[500px] overflow-y-auto shadow-xl">
                <div className="p-6">
                  <div className="text-base font-bold text-orange-500 mb-4 flex items-center justify-between">
                    <span>✓ Found {filteredMachines.length} machine{filteredMachines.length !== 1 ? 's' : ''} matching "{searchQuery}"</span>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-white text-sm"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-3">
                    {filteredMachines.slice(0, 50).map((machine, idx) => (
                      <div key={idx} className="bg-slate-700 rounded-lg p-5 hover:bg-slate-600 transition border-l-4 border-orange-500">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="text-white font-bold text-xl mb-1">
                              {machine.make} {machine.model}
                            </div>
                            <div className="text-orange-400 text-sm font-semibold">
                              {machine.track_sizes.length} Compatible Track Size{machine.track_sizes.length !== 1 ? ' Options' : ''}
                            </div>
                          </div>
                        </div>
                        <div className="bg-slate-800 rounded p-3">
                          <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">All Compatible Sizes:</div>
                          <div className="flex flex-wrap gap-2">
                            {machine.track_sizes.map((size, sizeIdx) => {
                              // Find track size details including price
                              const trackSizeDetails = trackSizes.find(ts => ts.size === size);
                              const widthInches = trackSizeDetails ? (trackSizeDetails.width / 25.4).toFixed(1) : '';
                              const pitchInches = trackSizeDetails ? (trackSizeDetails.pitch / 25.4).toFixed(2) : '';
                              const links = trackSizeDetails ? trackSizeDetails.links : '';
                              const inchSize = widthInches && pitchInches && links ? `${widthInches}"x${pitchInches}"x${links}` : '';
                              const price = trackSizeDetails?.price;
                              
                              return (
                                <div key={sizeIdx} className="flex flex-col">
                                  <button
                                    onClick={() => {
                                      const trackSize = trackSizes.find(ts => ts.size === size);
                                      if (trackSize) {
                                        handleTrackSizeClick(trackSize);
                                      }
                                    }}
                                    className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-md text-white font-bold font-mono text-base transition-all hover:scale-105"
                                  >
                                    {size}
                                  </button>
                                  {inchSize && (
                                    <div className="text-xs text-slate-400 mt-1 text-center font-mono">
                                      {inchSize}
                                    </div>
                                  )}
                                  {price && (
                                    <div className="text-sm text-green-400 font-bold mt-1 text-center">
                                      ${parseFloat(price).toFixed(2)}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredMachines.length > 50 && (
                    <div className="text-center text-slate-400 mt-4 text-sm bg-slate-700 rounded p-2">
                      Showing first 50 of {filteredMachines.length} results. Refine your search for more specific results.
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* No results message */}
            {searchQuery && filteredMachines.length === 0 && (
              <div className="mt-4 bg-red-900/20 border-2 border-red-500 rounded-lg p-6">
                <div className="text-red-300 text-center">
                  <div className="font-bold text-lg mb-2">No machines found matching "{searchQuery}"</div>
                  <div className="text-sm">
                    Try searching for:
                    <ul className="list-disc list-inside mt-2 text-left max-w-md mx-auto">
                      <li>Brand name only (e.g., "Bobcat", "Kubota", "John Deere")</li>
                      <li>Model number without spaces (e.g., "T190", "SVL75")</li>
                      <li>Partial model number (e.g., "T1", "SVL")</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Unit Toggle */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-slate-400">View sizes in:</span>
            <div className="flex bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => {
                  setUnit('mm');
                  const widthsMM = Object.keys(groupedSizes.mm || {}).sort((a, b) => parseInt(a) - parseInt(b));
                  if (widthsMM.length > 0) setSelectedWidth(widthsMM[0]);
                }}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  unit === 'mm' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Millimeters (mm)
              </button>
              <button
                onClick={() => {
                  setUnit('inches');
                  const widthsInches = Object.keys(groupedSizes.inches || {}).sort((a, b) => parseInt(a) - parseInt(b));
                  if (widthsInches.length > 0) setSelectedWidth(widthsInches[0]);
                }}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  unit === 'inches' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Inches (in)
              </button>
            </div>
          </div>
        </div>

        {/* Width Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {widths.map(width => (
              <button
                key={width}
                onClick={() => setSelectedWidth(width)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedWidth === width
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {width}{unit === 'mm' ? 'mm' : '"'} Width
              </button>
            ))}
          </div>
        </div>

        {/* Track Sizes Grid */}
        {selectedWidth && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {selectedSizes.map(trackSize => {
              const displaySize = convertSize(trackSize);
              const machineCount = compatibility.filter(comp => 
                comp.track_sizes.includes(trackSize.size)
              ).length;
              
              return (
                <button
                  key={trackSize.id}
                  onClick={() => handleTrackSizeClick(trackSize)}
                  className="text-left"
                >
                  <Card className="bg-slate-800 border-slate-700 hover:border-orange-500 transition-all duration-300 hover:scale-105 h-full cursor-pointer">
                    <CardContent className="p-6">
                      <div className="text-2xl font-bold text-white mb-2">
                        {displaySize.size}
                      </div>
                      <div className="text-sm text-slate-400 space-y-1 mb-3">
                        <div>Width: {displaySize.width}{unit === 'mm' ? 'mm' : '"'}</div>
                        <div>Pitch: {displaySize.pitch}{unit === 'mm' ? 'mm' : '"'}</div>
                        <div>Links: {displaySize.links}</div>
                      </div>
                      {unit === 'inches' && (
                        <div className="text-xs text-slate-500 mb-3">
                          ({trackSize.size} mm)
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700">
                        <div className="text-xs text-slate-400">
                          {machineCount} machine{machineCount !== 1 ? 's' : ''}
                        </div>
                        <div className="text-orange-500 font-semibold text-sm">
                          View →
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        )}

        {/* Compatibility Modal */}
        {selectedTrackSize && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-white mb-2">Track Size: {selectedTrackSize.size}</h3>
                    <div className="flex items-center gap-4 text-slate-300">
                      <div className="text-sm">
                        <span className="text-slate-400">In inches:</span> {(selectedTrackSize.width / 25.4).toFixed(1)}" x {(selectedTrackSize.pitch / 25.4).toFixed(2)}" x {selectedTrackSize.links}
                      </div>
                      {selectedTrackSize.price && (
                        <div className="bg-green-500 text-white px-4 py-2 rounded-lg">
                          <div className="text-xs font-semibold">PRICE</div>
                          <div className="text-2xl font-bold">${parseFloat(selectedTrackSize.price).toFixed(2)}</div>
                        </div>
                      )}
                    </div>
                    <p className="text-slate-400 mt-2">
                      Compatible with {compatibleMachines.length} machine{compatibleMachines.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button onClick={closeModal} className="text-slate-400 hover:text-white ml-4">
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {compatibleMachines.map((machine, idx) => (
                    <div key={idx} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-white font-bold text-lg">{machine.make}</div>
                          <div className="text-orange-500">{machine.model}</div>
                        </div>
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      {machine.track_sizes.length > 1 && (
                        <div className="mt-3 pt-3 border-t border-slate-600">
                          <div className="text-xs text-slate-400 mb-1">Other compatible sizes:</div>
                          <div className="text-sm text-slate-300">
                            {machine.track_sizes.filter(s => s !== selectedTrackSize.size).join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-white mb-4">How to Use the Compatibility Chart</h3>
          <div className="text-slate-300 space-y-3">
            <p>
              <strong className="text-orange-500">Click any track size</strong> to see all compatible machines. Track sizes are organized by width for easy browsing.
            </p>
            <p>
              Use the <strong className="text-orange-500">search bar</strong> above to quickly find your specific machine make and model.
            </p>
            <p className="text-sm text-slate-400 italic">
              Note: If a machine shows multiple track sizes, all options are compatible and can be used interchangeably. Always verify fitment for your specific application.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RubberTrackCompatibility;
