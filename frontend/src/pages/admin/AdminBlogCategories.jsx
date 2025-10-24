import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { toast } from '../../hooks/use-toast';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

const AdminBlogCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/api/admin/blog-categories`, { headers: { Authorization: `Bearer ${token}` } });
      setCategories(response.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch categories", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const url = editingCategory ? `${API}/api/admin/blog-categories/${editingCategory.id}` : `${API}/api/admin/blog-categories`;
      const method = editingCategory ? 'put' : 'post';
      await axios[method](url, formData, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Success", description: `Category ${editingCategory ? 'updated' : 'created'} successfully` });
      setDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to save category", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/admin/blog-categories/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Success", description: "Category deleted" });
      fetchCategories();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name || '', slug: category.slug || '', description: category.description || '' });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Blog Categories</h1>
          <p className="text-slate-400 mt-2">Organize your blog posts by categories</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600"><Plus className="h-4 w-4 mr-2" />Add Category</Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
              <DialogDescription className="text-slate-400">Create a category for blog organization</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Category Name *</Label>
                <Input value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) }); }} required className="bg-slate-800 border-slate-700" placeholder="e.g., Maintenance Tips" />
              </div>
              <div>
                <Label>Slug (URL) *</Label>
                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required className="bg-slate-800 border-slate-700" disabled={editingCategory} />
                <p className="text-xs text-slate-500 mt-1">Used in URL: /blog/category/slug</p>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-slate-800 border-slate-700" rows={3} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={() => { setDialogOpen(false); resetForm(); }} className="flex-1 bg-slate-700 hover:bg-slate-600">Cancel</Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600">{loading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          {loading && categories.length === 0 ? <p className="text-slate-400 text-center py-8">Loading...</p> : categories.length === 0 ? <p className="text-slate-400 text-center py-8">No categories found</p> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-4 text-slate-300">Name</th>
                    <th className="text-left p-4 text-slate-300">Slug</th>
                    <th className="text-left p-4 text-slate-300">Description</th>
                    <th className="text-right p-4 text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="p-4 text-white font-medium">{category.name}</td>
                      <td className="p-4 text-slate-400"><code className="bg-slate-800 px-2 py-1 rounded text-xs">{category.slug}</code></td>
                      <td className="p-4 text-slate-400 max-w-xs truncate">{category.description || '—'}</td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" onClick={() => handleEdit(category)} className="bg-blue-600 hover:bg-blue-700"><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" onClick={() => handleDelete(category.id)} className="bg-red-600 hover:bg-red-700"><Trash2 className="h-4 w-4" /></Button>
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

export default AdminBlogCategories;
