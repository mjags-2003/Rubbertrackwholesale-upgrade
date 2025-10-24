import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
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

const AdminSections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedPage, setSelectedPage] = useState('home');
  const [formData, setFormData] = useState({
    section_type: 'hero',
    page: 'home',
    title: '',
    heading1: '',
    heading2: '',
    content: '',
    button_text: '',
    button_link: '',
    background_image: '',
    images: '',
    order: 0,
    is_published: true,
    meta_title: '',
    meta_description: '',
  });

  useEffect(() => {
    fetchSections();
  }, [selectedPage]);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/api/admin/sections?page=${selectedPage}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSections(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sections",
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
      const url = editingSection 
        ? `${API}/api/admin/sections/${editingSection.id}`
        : `${API}/api/admin/sections`;
      
      const method = editingSection ? 'put' : 'post';

      const dataToSend = {
        ...formData,
        images: formData.images ? formData.images.split(',').map(img => img.trim()).filter(img => img) : [],
        order: parseInt(formData.order) || 0
      };

      await axios[method](url, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Success",
        description: `Section ${editingSection ? 'updated' : 'created'} successfully`
      });

      setDialogOpen(false);
      resetForm();
      fetchSections();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save section",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/admin/sections/${sectionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: "Success", description: "Section deleted successfully" });
      fetchSections();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      section_type: section.section_type || 'hero',
      page: section.page || 'home',
      title: section.title || '',
      heading1: section.heading1 || '',
      heading2: section.heading2 || '',
      content: section.content || '',
      button_text: section.button_text || '',
      button_link: section.button_link || '',
      background_image: section.background_image || '',
      images: Array.isArray(section.images) ? section.images.join(', ') : '',
      order: section.order || 0,
      is_published: section.is_published !== undefined ? section.is_published : true,
      meta_title: section.meta_title || '',
      meta_description: section.meta_description || '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSection(null);
    setFormData({
      section_type: 'hero',
      page: selectedPage,
      title: '',
      heading1: '',
      heading2: '',
      content: '',
      button_text: '',
      button_link: '',
      background_image: '',
      images: '',
      order: 0,
      is_published: true,
      meta_title: '',
      meta_description: '',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Homepage Sections (CMS)</h1>
          <p className="text-slate-400 mt-2">Manage all homepage sections dynamically</p>
        </div>
        <div className="flex gap-4 items-center">
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white"
          >
            <option value="home">Home Page</option>
            <option value="about">About Page</option>
            <option value="contact">Contact Page</option>
          </select>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingSection ? 'Edit Section' : 'Add New Section'}</DialogTitle>
                <DialogDescription className="text-slate-400">
                  {editingSection ? 'Update section content' : 'Create a new section for the page'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Section Type *</Label>
                    <select
                      value={formData.section_type}
                      onChange={(e) => setFormData({ ...formData, section_type: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white"
                      required
                    >
                      <option value="hero">Hero Banner</option>
                      <option value="features">Features Section</option>
                      <option value="cta">Call to Action</option>
                      <option value="content">Content Section</option>
                      <option value="testimonials">Testimonials</option>
                      <option value="custom">Custom Section</option>
                    </select>
                  </div>

                  <div>
                    <Label>Page *</Label>
                    <select
                      value={formData.page}
                      onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white"
                      required
                    >
                      <option value="home">Home Page</option>
                      <option value="about">About Page</option>
                      <option value="contact">Contact Page</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Section Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    placeholder="Section title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>H1 Heading (SEO)</Label>
                    <Input
                      value={formData.heading1}
                      onChange={(e) => setFormData({ ...formData, heading1: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      placeholder="Main heading"
                    />
                  </div>

                  <div>
                    <Label>H2 Heading (SEO)</Label>
                    <Input
                      value={formData.heading2}
                      onChange={(e) => setFormData({ ...formData, heading2: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      placeholder="Subheading"
                    />
                  </div>
                </div>

                <div>
                  <Label>Content (Rich Text)</Label>
                  <TipTapEditor
                    content={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Button Text</Label>
                    <Input
                      value={formData.button_text}
                      onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      placeholder="Contact Us, Learn More, etc."
                    />
                  </div>

                  <div>
                    <Label>Button Link</Label>
                    <Input
                      value={formData.button_link}
                      onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      placeholder="/contact, /products, etc."
                    />
                  </div>
                </div>

                <div>
                  <Label>Background Image URL</Label>
                  <Input
                    value={formData.background_image}
                    onChange={(e) => setFormData({ ...formData, background_image: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label>Additional Images (comma-separated URLs)</Label>
                  <Input
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    placeholder="https://img1.jpg, https://img2.jpg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Display Order *</Label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                      required
                      className="bg-slate-800 border-slate-700"
                      placeholder="0, 1, 2, etc."
                    />
                    <p className="text-xs text-slate-500 mt-1">Lower numbers appear first</p>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <select
                      value={formData.is_published ? 'published' : 'draft'}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.value === 'published' })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-4">
                  <h3 className="text-lg font-semibold text-white mb-3">SEO Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Meta Title</Label>
                      <Input
                        value={formData.meta_title}
                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                        placeholder="SEO title for this section"
                      />
                    </div>

                    <div>
                      <Label>Meta Description</Label>
                      <Input
                        value={formData.meta_description}
                        onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                        placeholder="SEO description"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
                    {loading ? 'Saving...' : (editingSection ? 'Update Section' : 'Create Section')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Instructions */}
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-800 mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold text-white mb-2">How to use:</h3>
          <ul className="text-slate-300 space-y-1">
            <li>• <strong>Section Types:</strong> Choose from Hero, Features, CTA, Content, Testimonials</li>
            <li>• <strong>SEO:</strong> Add H1 and H2 headings for better SEO</li>
            <li>• <strong>Rich Content:</strong> Use the editor for links, images, and formatting</li>
            <li>• <strong>Order:</strong> Control section display order (0 = first, 1 = second, etc.)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Sections List */}
      {loading && sections.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Loading sections...</div>
      ) : sections.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-12 text-center text-slate-400">
            No sections found for this page. Create your first section!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id} className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
                        {section.section_type}
                      </span>
                      <span className="text-slate-500 text-sm">Order: {section.order}</span>
                      {section.is_published ? (
                        <span className="flex items-center gap-1 text-green-400 text-sm">
                          <Eye className="h-3 w-3" /> Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-500 text-sm">
                          <EyeOff className="h-3 w-3" /> Draft
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {section.title || section.heading1 || 'Untitled Section'}
                    </h3>
                    {section.heading2 && (
                      <p className="text-slate-400 mb-2">{section.heading2}</p>
                    )}
                    {section.content && (
                      <div 
                        className="text-slate-300 text-sm line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(section)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-400 hover:text-red-300"
                      onClick={() => handleDelete(section.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSections;
