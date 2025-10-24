import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { toast } from '../../hooks/use-toast';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

const AdminRedirects = () => {
  const [redirects, setRedirects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState(null);
  const [formData, setFormData] = useState({ from_url: '', to_url: '', redirect_type: 301, is_active: true });

  useEffect(() => { fetchRedirects(); }, []);

  const fetchRedirects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/api/admin/redirects`, { headers: { Authorization: `Bearer ${token}` } });
      setRedirects(response.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch redirects", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const url = editingRedirect ? `${API}/api/admin/redirects/${editingRedirect.id}` : `${API}/api/admin/redirects`;
      const method = editingRedirect ? 'put' : 'post';
      await axios[method](url, formData, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Success", description: `Redirect ${editingRedirect ? 'updated' : 'created'} successfully` });
      setDialogOpen(false);
      resetForm();
      fetchRedirects();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to save redirect", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this redirect?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/admin/redirects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Success", description: "Redirect deleted" });
      fetchRedirects();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleEdit = (redirect) => {
    setEditingRedirect(redirect);
    setFormData({ from_url: redirect.from_url || '', to_url: redirect.to_url || '', redirect_type: redirect.redirect_type || 301, is_active: redirect.is_active !== undefined ? redirect.is_active : true });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingRedirect(null);
    setFormData({ from_url: '', to_url: '', redirect_type: 301, is_active: true });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">301 Redirect Management</h1>
          <p className="text-slate-400 mt-2">Manage URL redirects for SEO preservation</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600"><Plus className="h-4 w-4 mr-2" />Add Redirect</Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingRedirect ? 'Edit Redirect' : 'Add New Redirect'}</DialogTitle>
              <DialogDescription className="text-slate-400">Create 301 redirects to preserve SEO rankings</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>From URL (Old) *</Label>
                <Input value={formData.from_url} onChange={(e) => setFormData({ ...formData, from_url: e.target.value })} required className="bg-slate-800 border-slate-700" placeholder="/old-page" />
              </div>
              <div>
                <Label>To URL (New) *</Label>
                <Input value={formData.to_url} onChange={(e) => setFormData({ ...formData, to_url: e.target.value })} required className="bg-slate-800 border-slate-700" placeholder="/new-page" />
              </div>
              <div>
                <Label>Redirect Type</Label>
                <select value={formData.redirect_type} onChange={(e) => setFormData({ ...formData, redirect_type: parseInt(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white">
                  <option value={301}>301 (Permanent)</option>
                  <option value={302}>302 (Temporary)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4" />
                <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={() => { setDialogOpen(false); resetForm(); }} className="flex-1 bg-slate-700 hover:bg-slate-600">Cancel</Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600">{loading ? 'Saving...' : (editingRedirect ? 'Update' : 'Create')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          {loading && redirects.length === 0 ? <p className="text-slate-400 text-center py-8">Loading...</p> : redirects.length === 0 ? <p className="text-slate-400 text-center py-8">No redirects found</p> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-4 text-slate-300">From</th>
                    <th className="text-left p-4 text-slate-300">To</th>
                    <th className="text-left p-4 text-slate-300">Type</th>
                    <th className="text-left p-4 text-slate-300">Status</th>
                    <th className="text-right p-4 text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {redirects.map((redirect) => (
                    <tr key={redirect.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="p-4 text-white font-mono text-sm">{redirect.from_url}</td>
                      <td className="p-4 text-slate-400 font-mono text-sm">{redirect.to_url}</td>
                      <td className="p-4 text-slate-400">{redirect.redirect_type}</td>
                      <td className="p-4">
                        {redirect.is_active ? <span className="text-green-500 text-sm">Active</span> : <span className="text-slate-500 text-sm">Inactive</span>}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" onClick={() => handleEdit(redirect)} className="bg-blue-600 hover:bg-blue-700"><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" onClick={() => handleDelete(redirect.id)} className="bg-red-600 hover:bg-red-700"><Trash2 className="h-4 w-4" /></Button>
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

export default AdminRedirects;