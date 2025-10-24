import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
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

const API = process.env.REACT_APP_BACKEND_URL || '';

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    description: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: []
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/api/admin/brands`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBrands(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch brands",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      const url = editingBrand 
        ? `${API}/api/admin/brands/${editingBrand._id}`
        : `${API}/api/admin/brands`;
      
      const method = editingBrand ? 'put' : 'post';

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Success",
        description: `Brand ${editingBrand ? 'updated' : 'created'} successfully`
      });

      setDialogOpen(false);
      resetForm();
      fetchBrands();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save brand",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (brandId) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/admin/brands/${brandId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: "Success", description: "Brand deleted successfully" });
      fetchBrands();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete brand",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name || '',
      logo: brand.logo || '',
      description: brand.description || '',
      seo_title: brand.seo_title || '',
      seo_description: brand.seo_description || '',
      seo_keywords: brand.seo_keywords || []
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      logo: '',
      description: '',
      seo_title: '',
      seo_description: '',
      seo_keywords: []
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Brands Management</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingBrand ? 'Update brand information' : 'Create a new brand'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Brand Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <div>
                <Label>Logo URL</Label>
                <Input
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  rows={3}
                />
              </div>

              <div>
                <Label>SEO Title</Label>
                <Input
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <div>
                <Label>SEO Description</Label>
                <Textarea
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => { setDialogOpen(false); resetForm(); }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  {loading ? 'Saving...' : (editingBrand ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Note about Machine Models */}
      <div className="mb-4 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>Note:</strong> Machine models for each brand are managed in the code file <code className="bg-slate-800 px-2 py-1 rounded">frontend/src/data/machineModels.js</code>. 
          To add or edit machine models, please update that file and restart the frontend.
        </p>
      </div>

      {/* Brands List */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          {loading && brands.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Loading brands...</p>
          ) : brands.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No brands found. Create your first brand!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-4 text-slate-300">Logo</th>
                    <th className="text-left p-4 text-slate-300">Name</th>
                    <th className="text-left p-4 text-slate-300">Description</th>
                    <th className="text-left p-4 text-slate-300">SEO Title</th>
                    <th className="text-right p-4 text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => (
                    <tr key={brand._id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="p-4">
                        {brand.logo ? (
                          <img src={brand.logo} alt={brand.name} className="h-10 w-auto" />
                        ) : (
                          <div className="h-10 w-10 bg-slate-700 rounded flex items-center justify-center text-xs">
                            {brand.name?.charAt(0)}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-white font-medium">{brand.name}</td>
                      <td className="p-4 text-slate-400 max-w-xs truncate">
                        {brand.description || '—'}
                      </td>
                      <td className="p-4 text-slate-400 max-w-xs truncate">
                        {brand.seo_title || '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(brand)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDelete(brand._id)}
                            className="bg-red-600 hover:bg-red-700"
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBrands;
