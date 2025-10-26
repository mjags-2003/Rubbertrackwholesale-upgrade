import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const TrackSizeSearch = () => {
  const [trackSizes, setTrackSizes] = useState([]);
  const [groupedSizes, setGroupedSizes] = useState({});
  const [selectedWidth, setSelectedWidth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState('mm'); // 'mm' or 'inches'

  useEffect(() => {
    fetchTrackSizes();
  }, []);

  const fetchTrackSizes = async () => {
    try {
      const response = await axios.get(`${API}/api/track-sizes`);
      setTrackSizes(response.data);
      
      // Group by width for both mm and inches
      const groupedMM = {};
      const groupedInches = {};
      
      response.data.forEach(ts => {
        const widthMM = ts.width;
        if (widthMM) {
          // Group by mm
          const widthKeyMM = `${parseInt(widthMM)}`;
          if (!groupedMM[widthKeyMM]) {
            groupedMM[widthKeyMM] = [];
          }
          groupedMM[widthKeyMM].push(ts);
          
          // Group by inches (convert mm to inches: 1 inch = 25.4mm)
          const widthInches = Math.round(widthMM / 25.4);
          const widthKeyInches = `${widthInches}`;
          if (!groupedInches[widthKeyInches]) {
            groupedInches[widthKeyInches] = [];
          }
          groupedInches[widthKeyInches].push(ts);
        }
      });
      
      // Store both grouped versions
      setGroupedSizes({ mm: groupedMM, inches: groupedInches });
      
      // Set first width as default based on current unit
      const widthsMM = Object.keys(groupedMM).sort((a, b) => parseInt(a) - parseInt(b));
      if (widthsMM.length > 0) {
        setSelectedWidth(widthsMM[0]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch track sizes:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-8 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center text-white py-12">
            <p>Loading track sizes...</p>
          </div>
        </div>
      </section>
    );
  }

  const currentGroupedSizes = groupedSizes[unit] || {};
  const widths = Object.keys(currentGroupedSizes).sort((a, b) => parseInt(a) - parseInt(b));
  const selectedSizes = selectedWidth ? currentGroupedSizes[selectedWidth] || [] : [];
  
  // Convert size display based on unit
  const convertSize = (trackSize) => {
    if (unit === 'inches') {
      // Convert width and pitch from mm to inches
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

  return (
    <section className="py-12 bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">Find Rubber Track by Track Size</h2>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto mb-6">
            Browse our complete selection of rubber tracks organized by width. Select a width to view all available sizes.
          </p>
          
          {/* Unit Toggle */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-slate-400">View sizes in:</span>
            <div className="flex bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => {
                  setUnit('mm');
                  // Reset to first width in mm
                  const widthsMM = Object.keys(groupedSizes.mm || {}).sort((a, b) => parseInt(a) - parseInt(b));
                  if (widthsMM.length > 0) setSelectedWidth(widthsMM[0]);
                }}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  unit === 'mm'
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Millimeters (mm)
              </button>
              <button
                onClick={() => {
                  setUnit('inches');
                  // Reset to first width in inches
                  const widthsInches = Object.keys(groupedSizes.inches || {}).sort((a, b) => parseInt(a) - parseInt(b));
                  if (widthsInches.length > 0) setSelectedWidth(widthsInches[0]);
                }}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  unit === 'inches'
                    ? 'bg-orange-500 text-white'
                    : 'text-slate-300 hover:text-white'
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
            {selectedSizes.map(trackSize => (
              <Link
                key={trackSize.id}
                to={`/products?track_size=${encodeURIComponent(trackSize.size)}`}
              >
                <Card className="bg-slate-800 border-slate-700 hover:border-orange-500 transition-all duration-300 hover:scale-105 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-white mb-2">
                      {trackSize.size}
                    </div>
                    <div className="text-sm text-slate-400 space-y-1">
                      <div>Width: {trackSize.width}mm</div>
                      <div>Pitch: {trackSize.pitch}mm</div>
                      <div>Links: {trackSize.links}</div>
                    </div>
                    <div className="mt-4 text-orange-500 font-semibold">
                      View Products →
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-white mb-4">Understanding Track Sizes</h3>
          <div className="text-slate-300 space-y-3">
            <p>
              Track sizes are specified in the format <strong className="text-orange-500">Width x Pitch x Links</strong>:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Width:</strong> The width of the rubber track in millimeters</li>
              <li><strong>Pitch:</strong> The distance between track links in millimeters</li>
              <li><strong>Links:</strong> The total number of links in the track</li>
            </ul>
            <p className="mt-4">
              For example, a <strong className="text-orange-500">300x55x82</strong> track has a width of 300mm, pitch of 55mm, and 82 links.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrackSizeSearch;
