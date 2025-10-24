import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, Package, Wrench, Cog, Circle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

const ModelPage = () => {
  const { brand, model } = useParams();
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelData();
  }, [brand, model]);

  const fetchModelData = async () => {
    try {
      const response = await axios.get(`${API}/api/models/${brand}/${model}`);
      setModelData(response.data);
    } catch (error) {
      console.error('Error fetching model data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!modelData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white">Model not found</p>
      </div>
    );
  }

  const { brand: brandName, model: modelName, products, total_products, seo, brand_info } = modelData;
  
  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${brandName} ${modelName} Parts`,
    "description": seo.description,
    "brand": {
      "@type": "Brand",
      "name": brandName
    },
    "offers": {
      "@type": "AggregateOffer",
      "availability": total_products > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "priceCurrency": "USD",
      "offerCount": total_products
    }
  };

  // Breadcrumb structured data
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": window.location.origin
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Models",
        "item": `${window.location.origin}/models`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": brandName,
        "item": `${window.location.origin}/models/${brand}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": modelName,
        "item": window.location.href
      }
    ]
  };

  const categoryIcons = {
    rubber_tracks: <Package className="h-6 w-6" />,
    sprockets: <Cog className="h-6 w-6" />,
    idlers: <Circle className="h-6 w-6" />,
    rollers: <Wrench className="h-6 w-6" />
  };

  const categoryTitles = {
    rubber_tracks: "Rubber Tracks",
    sprockets: "Sprockets",
    idlers: "Idlers",
    rollers: "Rollers"
  };

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords.join(', ')} />
        <link rel="canonical" href={`${window.location.origin}${seo.canonical}`} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        {/* Breadcrumbs */}
        <div className="bg-slate-900 border-b border-slate-800">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-slate-400 hover:text-orange-500">Home</Link>
              <ChevronRight className="h-4 w-4 text-slate-600" />
              <Link to="/models" className="text-slate-400 hover:text-orange-500">Models</Link>
              <ChevronRight className="h-4 w-4 text-slate-600" />
              <Link to={`/models/${brand}`} className="text-slate-400 hover:text-orange-500">{brandName}</Link>
              <ChevronRight className="h-4 w-4 text-slate-600" />
              <span className="text-white font-medium">{modelName}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 py-12 border-b border-slate-800">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {brandName} {modelName} Parts
            </h1>
            <p className="text-xl text-slate-300 mb-6">
              Premium quality rubber tracks, sprockets, idlers, and rollers for your {brandName} {modelName}
            </p>
            <div className="flex gap-4 text-slate-400 mb-8">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-500" />
                <span>{total_products} Products Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="h-3 w-3 text-green-500" />
                <span>In Stock & Ready to Ship</span>
              </div>
            </div>

            {/* Quick Category Navigation */}
            {total_products > 0 && (
              <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                <p className="text-slate-300 text-sm font-semibold mb-3">Shop by Category:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {products.rubber_tracks.length > 0 && (
                    <a 
                      href="#rubber-tracks"
                      className="bg-slate-800 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-md transition-colors text-center flex items-center justify-center gap-2"
                    >
                      <Package className="h-4 w-4" />
                      Rubber Tracks ({products.rubber_tracks.length})
                    </a>
                  )}
                  {products.sprockets.length > 0 && (
                    <a 
                      href="#sprockets"
                      className="bg-slate-800 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-md transition-colors text-center flex items-center justify-center gap-2"
                    >
                      <Cog className="h-4 w-4" />
                      Sprockets ({products.sprockets.length})
                    </a>
                  )}
                  {products.idlers.length > 0 && (
                    <a 
                      href="#idlers"
                      className="bg-slate-800 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-md transition-colors text-center flex items-center justify-center gap-2"
                    >
                      <Circle className="h-4 w-4" />
                      Idlers ({products.idlers.length})
                    </a>
                  )}
                  {products.rollers.length > 0 && (
                    <a 
                      href="#rollers"
                      className="bg-slate-800 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-md transition-colors text-center flex items-center justify-center gap-2"
                    >
                      <Wrench className="h-4 w-4" />
                      Rollers ({products.rollers.length})
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Products by Category */}
        <div className="container mx-auto px-4 py-12">
          {Object.entries(products).map(([category, items]) => {
            if (items.length === 0) return null;

            return (
              <div key={category} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-orange-500">
                    {categoryIcons[category]}
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    {categoryTitles[category]}
                  </h2>
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
                    {items.length} Available
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((product) => (
                    <Link key={product.id} to={`/product/${product.id}`}>
                      <Card className="bg-slate-900 border-slate-800 hover:border-orange-500 transition-all h-full">
                        <CardContent className="p-6">
                          {product.images && product.images[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.alt_tags?.[0] || `${brandName} ${modelName} ${product.title}`}
                              className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                          )}
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {product.title}
                          </h3>
                          <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-orange-500">
                              ${product.price.toFixed(2)}
                            </span>
                            {product.in_stock ? (
                              <span className="flex items-center gap-1 text-green-500 text-sm">
                                <Circle className="h-2 w-2 fill-current" />
                                In Stock
                              </span>
                            ) : (
                              <span className="text-red-500 text-sm">Out of Stock</span>
                            )}
                          </div>
                          <div className="mt-3 text-sm text-slate-500">
                            SKU: {product.sku}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          {total_products === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">
                No products currently available for {brandName} {modelName}.
              </p>
              <p className="text-slate-500 mt-2">
                Check back soon or <Link to="/contact" className="text-orange-500 hover:underline">contact us</Link> for availability.
              </p>
            </div>
          )}
        </div>

        {/* SEO Content Section */}
        <div className="bg-slate-900 border-t border-slate-800 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                About {brandName} {modelName} Undercarriage Parts
              </h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  Find premium quality undercarriage parts for your {brandName} {modelName} compact track loader. 
                  We stock a complete range of rubber tracks, sprockets, idlers, and rollers specifically designed 
                  for the {brandName} {modelName} model.
                </p>
                <p>
                  All our {brandName} {modelName} parts meet or exceed OEM specifications and come with a satisfaction guarantee. 
                  Whether you need replacement tracks, drive sprockets, front idlers, or bottom rollers, we have 
                  you covered with fast shipping and competitive pricing.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-slate-950 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-2">Quality Guaranteed</h3>
                    <p className="text-slate-400 text-sm">
                      All parts are manufactured to strict quality standards and tested for durability.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-2">Fast Shipping</h3>
                    <p className="text-slate-400 text-sm">
                      In-stock items ship within 24 hours. Get your machine back to work quickly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModelPage;
