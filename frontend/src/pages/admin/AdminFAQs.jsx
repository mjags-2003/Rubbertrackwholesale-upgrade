import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { toast } from '../../hooks/use-toast';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

const AdminFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({ question: '', answer: '', category: 'General', order: 0, is_published: true });

  useEffect(() => { fetchFaqs(); }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/api/admin/faqs`, { headers: { Authorization: `Bearer ${token}` } });
      setFaqs(response.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch FAQs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const url = editingFaq ? `${API}/api/admin/faqs/${editingFaq.id}` : `${API}/api/admin/faqs`;
      const method = editingFaq ? 'put' : 'post';
      await axios[method](url, formData, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Success", description: `FAQ ${editingFaq ? 'updated' : 'created'} successfully` });
      setDialogOpen(false);
      resetForm();
      fetchFaqs();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to save FAQ", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/admin/faqs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Success", description: "FAQ deleted" });
      fetchFaqs();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({ question: faq.question || '', answer: faq.answer || '', category: faq.category || 'General', order: faq.order || 0, is_published: faq.is_published !== undefined ? faq.is_published : true });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingFaq(null);
    setFormData({ question: '', answer: '', category: 'General', order: 0, is_published: true });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">FAQs Management</h1>
          <p className="text-slate-400 mt-2">Manage Frequently Asked Questions with SEO schema</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600"><Plus className="h-4 w-4 mr-2" />Add FAQ</Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
              <DialogDescription className="text-slate-400">Create FAQ with rich SEO benefits</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Question *</Label>
                <Input value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} required className="bg-slate-800 border-slate-700" placeholder="What size track fits Bobcat T750?" />
              </div>
              <div>
                <Label>Answer *</Label>
                <Textarea value={formData.answer} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} required className="bg-slate-800 border-slate-700" rows={4} placeholder="Detailed answer here..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="bg-slate-800 border-slate-700" placeholder="General" />
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} className="bg-slate-800 border-slate-700" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_published" checked={formData.is_published} onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} className="w-4 h-4" />
                <Label htmlFor="is_published" className="cursor-pointer">Published</Label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={() => { setDialogOpen(false); resetForm(); }} className="flex-1 bg-slate-700 hover:bg-slate-600">Cancel</Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600">{loading ? 'Saving...' : (editingFaq ? 'Update' : 'Create')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          {loading && faqs.length === 0 ? <p className="text-slate-400 text-center py-8">Loading...</p> : faqs.length === 0 ? <p className="text-slate-400 text-center py-8">No FAQs found</p> : (
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.id} className="border border-slate-800 rounded-lg p-4 bg-slate-800/50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {faq.is_published ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-slate-500" />}
                        <span className="text-xs bg-slate-700 px-2 py-1 rounded">{faq.category}</span>
                      </div>
                      <h3 className="text-white font-semibold mb-2">{faq.question}</h3>
                      <p className="text-slate-400 text-sm">{faq.answer}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" onClick={() => handleEdit(faq)} className="bg-blue-600 hover:bg-blue-700"><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" onClick={() => handleDelete(faq.id)} className="bg-red-600 hover:bg-red-700"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFAQs;