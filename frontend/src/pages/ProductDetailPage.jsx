import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Truck, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { products } from '../mockData';
import { toast } from '../hooks/use-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === parseInt(id));
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Product not found</h2>
          <Button onClick={() => navigate('/products')} className="bg-orange-500 hover:bg-orange-600">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    toast({
      title: "Added to cart!",
      description: `${quantity} x ${product.title} added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/products')}
          className="text-slate-400 hover:text-orange-500 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <Card className="bg-slate-900 border-slate-800 mb-4">
              <CardContent className="p-0">
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="w-full h-96 object-cover rounded-t-lg"
                />
              </CardContent>
            </Card>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-1 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-orange-500' : 'border-slate-800'
                    }`}
                  >
                    <img src={image} alt={`${product.title} ${index + 1}`} className="w-full h-24 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <span className="inline-block bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                {product.brand}
              </span>
              <h1 className="text-4xl font-bold text-white mb-2">{product.title}</h1>
              <div className="flex items-center gap-4 text-slate-400">
                <span>SKU: {product.sku}</span>
                <span>•</span>
                <span>Part #: {product.partNumber}</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-white">${product.price.toFixed(2)}</span>
                {product.inStock ? (
                  <span className="flex items-center text-green-500 text-sm font-semibold">
                    <Check className="h-4 w-4 mr-1" />
                    In Stock
                  </span>
                ) : (
                  <span className="text-red-500 text-sm font-semibold">Out of Stock</span>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-white font-semibold">Quantity:</label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="border-slate-700 text-white hover:bg-slate-800"
                  >
                    -
                  </Button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center bg-slate-800 border border-slate-700 rounded text-white"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                    className="border-slate-700 text-white hover:bg-slate-800"
                  >
                    +
                  </Button>
                </div>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-4 text-center">
                  <Truck className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-white text-sm font-semibold">Free Shipping</p>
                  <p className="text-slate-400 text-xs">On orders over $500</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-4 text-center">
                  <Shield className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-white text-sm font-semibold">Warranty</p>
                  <p className="text-slate-400 text-xs">{product.specifications.warranty}</p>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-3">Description</h2>
              <p className="text-slate-300 leading-relaxed">{product.description}</p>
            </div>

            {/* Specifications */}
            <div>
              <h2 className="text-xl font-bold text-white mb-3">Specifications</h2>
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-0">
                  <table className="w-full">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value], index) => (
                        <tr key={key} className={index !== 0 ? 'border-t border-slate-800' : ''}>
                          <td className="p-4 text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                          <td className="p-4 text-white font-semibold text-right">{value}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-slate-800">
                        <td className="p-4 text-slate-400">Track Size</td>
                        <td className="p-4 text-white font-semibold text-right">{product.size}</td>
                      </tr>
                      <tr className="border-t border-slate-800">
                        <td className="p-4 text-slate-400">Category</td>
                        <td className="p-4 text-white font-semibold text-right">{product.category}</td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
