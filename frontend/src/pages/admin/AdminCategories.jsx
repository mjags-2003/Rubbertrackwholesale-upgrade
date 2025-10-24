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

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: []
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/api/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
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
      const url = editingCategory 
        ? `${API}/api/admin/categories/${editingCategory._id}`
        : `${API}/api/admin/categories`;
      
      const method = editingCategory ? 'put' : 'post';

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Success",
        description: `Category ${editingCategory ? 'updated' : 'created'} successfully`
      });

      setDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save category",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/admin/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: "Success", description: "Category deleted successfully" });
      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      image: category.image || '',
      seo_title: category.seo_title || '',
      seo_description: category.seo_description || '',
      seo_keywords: category.seo_keywords || []
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      seo_title: '',
      seo_description: '',
      seo_keywords: []
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Categories Management</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingCategory ? 'Update category information' : 'Create a new category'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Category Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-slate-800 border-slate-700"
                  placeholder="e.g., Rubber Tracks, Sprockets, Idlers"
                />
              </div>

              <div>
                <Label>Image URL</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  placeholder="https://example.com/category-image.png"
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
                  {loading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories List */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          {loading && categories.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No categories found. Create your first category!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-4 text-slate-300">Image</th>
                    <th className="text-left p-4 text-slate-300">Name</th>
                    <th className="text-left p-4 text-slate-300">Description</th>
                    <th className="text-left p-4 text-slate-300">SEO Title</th>
                    <th className="text-right p-4 text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="p-4">
                        {category.image ? (
                          <img src={category.image} alt={category.name} className="h-10 w-auto" />
                        ) : (
                          <div className="h-10 w-10 bg-slate-700 rounded flex items-center justify-center text-xs">
                            {category.name?.charAt(0)}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-white font-medium">{category.name}</td>
                      <td className="p-4 text-slate-400 max-w-xs truncate">
                        {category.description || '—'}
                      </td>
                      <td className="p-4 text-slate-400 max-w-xs truncate">
                        {category.seo_title || '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(category)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDelete(category._id)}
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

export default AdminCategories;
