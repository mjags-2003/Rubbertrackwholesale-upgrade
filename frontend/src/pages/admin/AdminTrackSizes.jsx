import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';
import axios from 'axios';
import { Plus, Edit, Trash2, Download } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AdminTrackSizes = () => {
  const [trackSizes, setTrackSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    size: '',
    price: '',
    description: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTrackSizes();
  }, []);

  const fetchTrackSizes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/api/admin/track-sizes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrackSizes(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch track sizes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      if (editingId) {
        await axios.put(`${API}/api/admin/track-sizes/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({
          title: "Success",
          description: "Track size updated successfully"
        });
      } else {
        await axios.post(`${API}/api/admin/track-sizes`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({
          title: "Success",
          description: "Track size created successfully"
        });
      }
      fetchTrackSizes();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Operation failed",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this track size?')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/admin/track-sizes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({
        title: "Success",
        description: "Track size deleted successfully"
      });
      fetchTrackSizes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete track size",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (trackSize) => {
    setFormData({
      size: trackSize.size,
      description: trackSize.description || '',
      is_active: trackSize.is_active
    });
    setEditingId(trackSize.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      size: '',
      description: '',
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-white">Loading track sizes...</div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Track Sizes Management</h1>
        <Button onClick={() => setShowForm(true)} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Track Size
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="text-slate-400 text-sm">Total Track Sizes</div>
            <div className="text-3xl font-bold text-white mt-2">{trackSizes.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="text-slate-400 text-sm">Active Sizes</div>
            <div className="text-3xl font-bold text-green-500 mt-2">
              {trackSizes.filter(ts => ts.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="text-slate-400 text-sm">Unique Widths</div>
            <div className="text-3xl font-bold text-blue-500 mt-2">
              {new Set(trackSizes.map(ts => ts.width).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {editingId ? 'Edit Track Size' : 'Add New Track Size'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2">Size (e.g., 300x55x82)</label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-4 py-2"
                  required
                  placeholder="300x55x82"
                />
              </div>
              
              <div>
                <label className="block text-slate-300 mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-4 py-2"
                  rows="3"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="mr-2"
                />
                <label className="text-slate-300">Active</label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button type="button" onClick={resetForm} className="bg-slate-700 hover:bg-slate-600">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Track Sizes List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Track Sizes ({trackSizes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-300 py-3 px-4">Size</th>
                  <th className="text-left text-slate-300 py-3 px-4">Width</th>
                  <th className="text-left text-slate-300 py-3 px-4">Pitch</th>
                  <th className="text-left text-slate-300 py-3 px-4">Links</th>
                  <th className="text-left text-slate-300 py-3 px-4">Status</th>
                  <th className="text-right text-slate-300 py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trackSizes.map((trackSize) => (
                  <tr key={trackSize.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-4 text-white font-medium">{trackSize.size}</td>
                    <td className="py-3 px-4 text-slate-300">{trackSize.width ? `${trackSize.width}mm` : '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{trackSize.pitch ? `${trackSize.pitch}mm` : '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{trackSize.links || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        trackSize.is_active 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trackSize.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleEdit(trackSize)}
                          className="bg-blue-500 hover:bg-blue-600 h-8 px-3"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(trackSize.id)}
                          className="bg-red-500 hover:bg-red-600 h-8 px-3"
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

export default AdminTrackSizes;
