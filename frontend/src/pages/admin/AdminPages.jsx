import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import TipTapEditor from '../../components/TipTapEditor';
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
import { Label } from '../../components/ui/label';
import { toast } from '../../hooks/use-toast';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    page_type: 'custom',
    meta_title: '',
    meta_description: '',
    meta_keywords: [],
    is_published: true
  });

  // Quill modules with video and link support
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'image', 'video',
    'blockquote', 'code-block'
  ];

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/api/admin/pages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPages(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pages",
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
      const url = editingPage 
        ? `${API}/api/admin/pages/${editingPage.id}`
        : `${API}/api/admin/pages`;
      
      const method = editingPage ? 'put' : 'post';

      const dataToSend = {
        ...formData,
        meta_keywords: Array.isArray(formData.meta_keywords) 
          ? formData.meta_keywords 
          : formData.meta_keywords.split(',').map(k => k.trim()).filter(k => k)
      };

      await axios[method](url, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Success",
        description: `Page ${editingPage ? 'updated' : 'created'} successfully`
      });

      setDialogOpen(false);
      resetForm();
      fetchPages();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save page",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pageId) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/admin/pages/${pageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: "Success", description: "Page deleted successfully" });
      fetchPages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setFormData({
      slug: page.slug || '',
      title: page.title || '',
      content: page.content || '',
      page_type: page.page_type || 'custom',
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      meta_keywords: Array.isArray(page.meta_keywords) ? page.meta_keywords.join(', ') : '',
      is_published: page.is_published !== undefined ? page.is_published : true
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPage(null);
    setFormData({
      slug: '',
      title: '',
      content: '',
      page_type: 'custom',
      meta_title: '',
      meta_description: '',
      meta_keywords: [],
      is_published: true
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Pages Management (CMS)</h1>
          <p className="text-slate-400 mt-2">Manage all website pages content with rich text editor</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Page
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPage ? 'Edit Page' : 'Add New Page'}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {editingPage ? 'Update page content' : 'Create a new page with rich content'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Page Slug (URL) *</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    className="bg-slate-800 border-slate-700"
                    placeholder="e.g., home, about, contact"
                    disabled={editingPage && ['home', 'about', 'contact'].includes(editingPage.slug)}
                  />
                  <p className="text-xs text-slate-500 mt-1">Used in URL: /page/slug</p>
                </div>

                <div>
                  <Label>Page Type *</Label>
                  <select
                    value={formData.page_type}
                    onChange={(e) => setFormData({ ...formData, page_type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white"
                    required
                  >
                    <option value="custom">Custom Page</option>
                    <option value="home">Home Page</option>
                    <option value="about">About Page</option>
                    <option value="contact">Contact Page</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Page Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-slate-800 border-slate-700"
                  placeholder="Page display title"
                />
              </div>

              <div>
                <Label>Page Content (Rich Text) *</Label>
                <div className="bg-white rounded-md">
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    modules={modules}
                    formats={formats}
                    className="text-black"
                    style={{ minHeight: '300px' }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Rich text editor with support for: headings, lists, links, images, YouTube videos, formatting
                </p>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <h3 className="text-lg font-semibold text-orange-500 mb-3">SEO Settings</h3>
                
                <div className="space-y-3">
                  <div>
                    <Label>Meta Title</Label>
                    <Input
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      placeholder="SEO title for search engines"
                    />
                  </div>

                  <div>
                    <Label>Meta Description</Label>
                    <Input
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      placeholder="SEO description (150-160 characters)"
                    />
                  </div>

                  <div>
                    <Label>Meta Keywords (comma separated)</Label>
                    <Input
                      value={formData.meta_keywords}
                      onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="is_published" className="cursor-pointer">
                  Published (visible to public)
                </Label>
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
                  {loading ? 'Saving...' : (editingPage ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Help Text */}
      <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
        <h3 className="text-blue-300 font-semibold mb-2">How to use:</h3>
        <ul className="text-sm text-blue-200 space-y-1 list-disc list-inside">
          <li><strong>YouTube Videos:</strong> Click video icon, paste YouTube URL</li>
          <li><strong>Links:</strong> Select text, click link icon, enter URL</li>
          <li><strong>Images:</strong> Click image icon, enter image URL</li>
          <li><strong>Formatting:</strong> Use toolbar for headers, bold, colors, lists, etc.</li>
        </ul>
      </div>

      {/* Pages List */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          {loading && pages.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Loading pages...</p>
          ) : pages.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No pages found. Create your first page!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-4 text-slate-300">Status</th>
                    <th className="text-left p-4 text-slate-300">Title</th>
                    <th className="text-left p-4 text-slate-300">Slug</th>
                    <th className="text-left p-4 text-slate-300">Type</th>
                    <th className="text-left p-4 text-slate-300">Updated</th>
                    <th className="text-right p-4 text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr key={page.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="p-4">
                        {page.is_published ? (
                          <span className="flex items-center gap-1 text-green-500 text-sm">
                            <Eye className="h-4 w-4" />
                            Published
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-500 text-sm">
                            <EyeOff className="h-4 w-4" />
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-white font-medium">{page.title}</td>
                      <td className="p-4 text-slate-400">
                        <code className="bg-slate-800 px-2 py-1 rounded text-xs">/{page.slug}</code>
                      </td>
                      <td className="p-4 text-slate-400 capitalize">{page.page_type}</td>
                      <td className="p-4 text-slate-400 text-sm">
                        {new Date(page.updated_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(page)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDelete(page.id)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={['home', 'about', 'contact'].includes(page.slug)}
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

export default AdminPages;
