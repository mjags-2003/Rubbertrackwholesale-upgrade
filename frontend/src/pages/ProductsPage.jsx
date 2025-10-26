import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { products, brands, categories } from '../mockData';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'all');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('featured');

  // Update searchTerm when URL changes
  React.useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter - enhanced for machine models
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (product) => {
          // Search in title, SKU, part number, size
          const titleMatch = product.title.toLowerCase().includes(searchLower);
          const skuMatch = product.sku.toLowerCase().includes(searchLower);
          const partNumberMatch = product.partNumber.toLowerCase().includes(searchLower);
          const sizeMatch = product.size.toLowerCase().includes(searchLower);
          
          // Also search in compatibleWith field if it exists (for machine models)
          const compatibleMatch = product.compatibleWith ? 
            product.compatibleWith.toLowerCase().includes(searchLower) : false;
          
          // Multi-word search for machine models (e.g., "cat 299d", "bobcat t190")
          const searchWords = searchLower.split(/\s+/);
          if (searchWords.length > 1) {
            const titleWords = product.title.toLowerCase();
            const allWordsMatch = searchWords.every(word => titleWords.includes(word));
            if (allWordsMatch) return true;
          }
          
          return titleMatch || skuMatch || partNumberMatch || sizeMatch || compatibleMatch;
        }
      );
    }

    // Brand filter
    if (selectedBrand !== 'all') {
      filtered = filtered.filter((product) => product.brand === selectedBrand);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return filtered;
  }, [searchTerm, selectedBrand, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBrand('all');
    setSelectedCategory('all');
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <section className="bg-slate-900 py-12 border-b border-slate-800">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-4">All Products</h1>
          <p className="text-slate-400 text-lg">Browse our complete selection of rubber tracks and undercarriage parts</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-slate-900 rounded-lg p-6 mb-8 border border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by size, part number, or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-400 pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>

            {/* Brand Filter */}
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.name}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters and Sort */}
          <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
            <div className="flex items-center gap-2">
              {(searchTerm || selectedBrand !== 'all' || selectedCategory !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-orange-500 hover:text-orange-400"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
              <span className="text-slate-400 text-sm">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </span>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Filter className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-slate-400 mb-2">No products found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your search or filters</p>
            <Button onClick={clearFilters} className="bg-orange-500 hover:bg-orange-600">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-slate-900 border-slate-800 hover:border-orange-500 transition-all duration-300 group">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.inStock && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        In Stock
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-orange-500 text-xs font-semibold mb-1">{product.brand}</p>
                    <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{product.title}</h3>
                    <p className="text-slate-400 text-xs mb-1">SKU: {product.sku}</p>
                    <p className="text-slate-400 text-xs mb-3">{product.size}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-white">${product.price.toFixed(2)}</span>
                      <Link to={`/product/${product.id}`}>
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
