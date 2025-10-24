import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { toast } from '../../hooks/use-toast';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({ title: '', slug: '', content: '', excerpt: '', featured_image: '', category_id: '', tags: '', meta_title: '', meta_description: '', meta_keywords: '', is_published: false });

  const modules = {
    toolbar: [[{ 'header': [1, 2, 3, false] }], ['bold', 'italic', 'underline'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['link', 'image', 'video'], ['clean']]
  };

  useEffect(() => { fetchBlogs(); fetchCategories(); }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/api/admin/blogs`, { headers: { Authorization: `Bearer ${token}` } });
      setBlogs(response.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch blogs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/api/admin/blog-categories`, { headers: { Authorization: `Bearer ${token}` } });
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const url = editingBlog ? `${API}/api/admin/blogs/${editingBlog.id}` : `${API}/api/admin/blogs`;
      const method = editingBlog ? 'put' : 'post';
      const dataToSend = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        meta_keywords: formData.meta_keywords ? formData.meta_keywords.split(',').map(k => k.trim()).filter(k => k) : []
      };
      await axios[method](url, dataToSend, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Success", description: `Blog ${editingBlog ? 'updated' : 'created'} successfully` });
      setDialogOpen(false);
      resetForm();
      fetchBlogs();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to save blog", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/admin/blogs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Success", description: "Blog deleted" });
      fetchBlogs();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || '',
      slug: blog.slug || '',
      content: blog.content || '',
      excerpt: blog.excerpt || '',
      featured_image: blog.featured_image || '',
      category_id: blog.category_id || '',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
      meta_title: blog.meta_title || '',
      meta_description: blog.meta_description || '',
      meta_keywords: Array.isArray(blog.meta_keywords) ? blog.meta_keywords.join(', ') : '',
      is_published: blog.is_published || false
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingBlog(null);
    setFormData({ title: '', slug: '', content: '', excerpt: '', featured_image: '', category_id: '', tags: '', meta_title: '', meta_description: '', meta_keywords: '', is_published: false });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Blog Management</h1>
          <p className="text-slate-400 mt-2">Create and manage blog posts with rich content</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600"><Plus className="h-4 w-4 mr-2" />Add Blog</Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBlog ? 'Edit Blog' : 'Create New Blog'}</DialogTitle>
              <DialogDescription className="text-slate-400">Write SEO-optimized blog content</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={formData.title} onChange={(e) => { setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) }); }} required className="bg-slate-800 border-slate-700" />
              </div>
              <div>
                <Label>Slug (URL) *</Label>
                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required className="bg-slate-800 border-slate-700" disabled={editingBlog} />
              </div>
              <div>
                <Label>Content *</Label>
                <div className="bg-white rounded-md">
                  <ReactQuill theme="snow" value={formData.content} onChange={(value) => setFormData({ ...formData, content: value })} modules={modules} className="text-black" style={{ minHeight: '250px' }} />
                </div>
              </div>
              <div>
                <Label>Excerpt</Label>
                <Input value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} className="bg-slate-800 border-slate-700" placeholder="Short summary..." />
              </div>
              <div>
                <Label>Featured Image URL</Label>
                <Input value={formData.featured_image} onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })} className="bg-slate-800 border-slate-700" />
              </div>
              <div>
                <Label>Category</Label>
                <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white">
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="bg-slate-800 border-slate-700" placeholder="rubber tracks, maintenance, tips" />
              </div>
              <div className="border-t border-slate-800 pt-4">
                <h3 className="text-lg font-semibold text-orange-500 mb-3">SEO Settings</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Meta Title</Label>
                    <Input value={formData.meta_title} onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} className="bg-slate-800 border-slate-700" />
                  </div>
                  <div>
                    <Label>Meta Description</Label>
                    <Input value={formData.meta_description} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} className="bg-slate-800 border-slate-700" />
                  </div>
                  <div>
                    <Label>Meta Keywords</Label>
                    <Input value={formData.meta_keywords} onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })} className="bg-slate-800 border-slate-700" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_published" checked={formData.is_published} onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} className="w-4 h-4" />
                <Label htmlFor="is_published" className="cursor-pointer">Published</Label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={() => { setDialogOpen(false); resetForm(); }} className="flex-1 bg-slate-700 hover:bg-slate-600">Cancel</Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600">{loading ? 'Saving...' : (editingBlog ? 'Update' : 'Create')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          {loading && blogs.length === 0 ? <p className="text-slate-400 text-center py-8">Loading...</p> : blogs.length === 0 ? <p className="text-slate-400 text-center py-8">No blogs found</p> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-4 text-slate-300">Title</th>
                    <th className="text-left p-4 text-slate-300">Slug</th>
                    <th className="text-left p-4 text-slate-300">Status</th>
                    <th className="text-left p-4 text-slate-300">Date</th>
                    <th className="text-right p-4 text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog) => (
                    <tr key={blog.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="p-4 text-white font-medium">{blog.title}</td>
                      <td className="p-4 text-slate-400"><code className="bg-slate-800 px-2 py-1 rounded text-xs">{blog.slug}</code></td>
                      <td className="p-4">{blog.is_published ? <span className="text-green-500 text-sm">Published</span> : <span className="text-slate-500 text-sm">Draft</span>}</td>
                      <td className="p-4 text-slate-400 text-sm">{blog.published_at ? new Date(blog.published_at).toLocaleDateString() : '—'}</td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" onClick={() => handleEdit(blog)} className="bg-blue-600 hover:bg-blue-700"><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" onClick={() => handleDelete(blog.id)} className="bg-red-600 hover:bg-red-700"><Trash2 className="h-4 w-4" /></Button>
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

export default AdminBlogs;