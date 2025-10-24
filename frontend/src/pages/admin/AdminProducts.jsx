import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Upload, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { toast } from '../../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    title: '',
    description: '',
    price: 0,
    brand: '',
    category: '',
    size: '',
    part_number: '',
    images: [''],
    in_stock: true,
    stock_quantity: 0,
    specifications: {},
    seo_title: '',
    seo_description: '',
    seo_keywords: [],
    alt_tags: ['']
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchProducts();
    fetchBrandsAndCategories();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandsAndCategories = async () => {
    try {
      const brandsRes = await axios.get(`${API}/brands`);
      const categoriesRes = await axios.get(`${API}/categories`);
      setBrands(brandsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching brands/categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('admin_token');
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        seo_keywords: typeof formData.seo_keywords === 'string' 
          ? formData.seo_keywords.split(',').map(k => k.trim()) 
          : formData.seo_keywords,
        alt_tags: formData.alt_tags.filter(tag => tag.trim() !== ''),
        images: formData.images.filter(img => img.trim() !== '')
      };

      if (editingProduct) {
        await axios.put(`${API}/admin/products/${editingProduct.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        await axios.post(`${API}/admin/products`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({ title: "Success", description: "Product created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save product",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Success", description: "Product deleted successfully" });
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      seo_keywords: Array.isArray(product.seo_keywords) ? product.seo_keywords.join(', ') : '',
      alt_tags: product.alt_tags || [''],
      images: product.images.length > 0 ? product.images : ['']
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      sku: '',
      title: '',
      description: '',
      price: 0,
      brand: '',
      category: '',
      size: '',
      part_number: '',
      images: [''],
      in_stock: true,
      stock_quantity: 0,
      specifications: {},
      seo_title: '',
      seo_description: '',
      seo_keywords: [],
      alt_tags: ['']
    });
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.part_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-slate-400">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Products Management</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription className="text-slate-400">
                Fill in product details and SEO information
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-orange-500">Basic Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>SKU *</Label>
                    <Input
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>
                  <div>
                    <Label>Part Number *</Label>
                    <Input
                      value={formData.part_number}
                      onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Product Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>

                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price (USD) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>
                  <div>
                    <Label>Stock Quantity *</Label>
                    <Input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Brand *</Label>
                    <select
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white"
                      required
                    >
                      <option value="">Select Brand</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.name}>{brand.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Size (e.g., 450x86x56)</Label>
                    <Input
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <Label>Image URLs (one per line)</Label>
                  {formData.images.map((img, index) => (
                    <Input
                      key={index}
                      value={img}
                      onChange={(e) => {
                        const newImages = [...formData.images];
                        newImages[index] = e.target.value;
                        setFormData({ ...formData, images: newImages });
                      }}
                      className="bg-slate-800 border-slate-700 mb-2"
                      placeholder="https://example.com/image.jpg"
                    />
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setFormData({ ...formData, images: [...formData.images, ''] })}
                    className="mt-2"
                  >
                    Add Image URL
                  </Button>
                </div>
              </div>

              {/* SEO Section */}
              <div className="space-y-4 border-t border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-orange-500">SEO Settings</h3>
                
                <div>
                  <Label>SEO Title</Label>
                  <Input
                    value={formData.seo_title}
                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    placeholder="Auto-generated if left empty"
                  />
                </div>

                <div>
                  <Label>SEO Description</Label>
                  <Textarea
                    value={formData.seo_description}
                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    rows={3}
                    placeholder="Auto-generated if left empty"
                  />
                </div>

                <div>
                  <Label>SEO Keywords (comma-separated)</Label>
                  <Input
                    value={formData.seo_keywords}
                    onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    placeholder="rubber tracks, bobcat tracks, skid steer parts"
                  />
                </div>

                <div>
                  <Label>Image Alt Tags</Label>
                  {formData.alt_tags.map((tag, index) => (
                    <Input
                      key={index}
                      value={tag}
                      onChange={(e) => {
                        const newTags = [...formData.alt_tags];
                        newTags[index] = e.target.value;
                        setFormData({ ...formData, alt_tags: newTags });
                      }}
                      className="bg-slate-800 border-slate-700 mb-2"
                      placeholder="Descriptive alt text for image"
                    />
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setFormData({ ...formData, alt_tags: [...formData.alt_tags, ''] })}
                    className="mt-2"
                  >
                    Add Alt Tag
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by title, SKU, or part number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-800 text-slate-200"
          />
        </div>
      </div>

      {/* Products Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="text-left p-4 text-slate-300 font-semibold">Product</th>
                  <th className="text-left p-4 text-slate-300 font-semibold">SKU</th>
                  <th className="text-left p-4 text-slate-300 font-semibold">Brand</th>
                  <th className="text-left p-4 text-slate-300 font-semibold">Price</th>
                  <th className="text-left p-4 text-slate-300 font-semibold">Stock</th>
                  <th className="text-right p-4 text-slate-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.images && product.images[0] && (
                          <img src={product.images[0]} alt={product.title} className="w-12 h-12 object-cover rounded" />
                        )}
                        <div>
                          <p className="text-white font-semibold">{product.title}</p>
                          <p className="text-slate-400 text-sm">{product.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{product.sku}</td>
                    <td className="p-4 text-slate-300">{product.brand}</td>
                    <td className="p-4 text-slate-300">${product.price.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.in_stock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {product.in_stock ? `${product.stock_quantity} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(product)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;
