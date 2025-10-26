import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';
import axios from 'axios';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AdminCompatibility = () => {
  const [compatibilityData, setCompatibilityData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    track_sizes: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCompatibilityData();
  }, []);

  useEffect(() => {
    // Filter data based on search query
    if (searchQuery) {
      const filtered = compatibilityData.filter(item =>
        item.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.track_sizes.some(size => size.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(compatibilityData);
    }
  }, [searchQuery, compatibilityData]);

  const fetchCompatibilityData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/api/admin/compatibility`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompatibilityData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch compatibility data",
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
      
      // Convert track_sizes string to array
      const track_sizes_array = formData.track_sizes.split(',').map(s => s.trim()).filter(Boolean);
      const submitData = {
        ...formData,
        track_sizes: track_sizes_array
      };
      
      if (editingId) {
        await axios.put(`${API}/api/admin/compatibility/${editingId}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({
          title: "Success",
          description: "Compatibility entry updated successfully"
        });
      } else {
        await axios.post(`${API}/api/admin/compatibility`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({
          title: "Success",
          description: "Compatibility entry created successfully"
        });
      }
      fetchCompatibilityData();
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
    if (!window.confirm('Are you sure you want to delete this compatibility entry?')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/admin/compatibility/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({
        title: "Success",
        description: "Compatibility entry deleted successfully"
      });
      fetchCompatibilityData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete compatibility entry",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      make: entry.make,
      model: entry.model,
      track_sizes: entry.track_sizes.join(', '),
      is_active: entry.is_active
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      track_sizes: '',
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Get unique makes for statistics
  const uniqueMakes = [...new Set(compatibilityData.map(item => item.make))];
  const totalMachines = compatibilityData.length;

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="text-white">Loading compatibility data...</div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Compatibility Management</h1>
        <Button onClick={() => setShowForm(true)} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Compatibility Entry
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="text-slate-400 text-sm">Total Machines</div>
            <div className="text-3xl font-bold text-white mt-2">{totalMachines}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="text-slate-400 text-sm">Unique Makes</div>
            <div className="text-3xl font-bold text-green-500 mt-2">{uniqueMakes.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="text-slate-400 text-sm">Active Entries</div>
            <div className="text-3xl font-bold text-blue-500 mt-2">
              {compatibilityData.filter(item => item.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by make, model, or track size..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Form */}
      {showForm && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {editingId ? 'Edit Compatibility Entry' : 'Add New Compatibility Entry'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-2">Make / Brand</label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({...formData, make: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-4 py-2"
                    required
                    placeholder="e.g., Bobcat"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-300 mb-2">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-4 py-2"
                    required
                    placeholder="e.g., T190"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-slate-300 mb-2">Track Sizes (comma-separated)</label>
                <input
                  type="text"
                  value={formData.track_sizes}
                  onChange={(e) => setFormData({...formData, track_sizes: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-md px-4 py-2"
                  required
                  placeholder="e.g., 320x86x52, 400x86x52"
                />
                <p className="text-xs text-slate-400 mt-1">Enter multiple track sizes separated by commas</p>
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

      {/* Compatibility List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            Compatibility Entries ({filteredData.length} of {totalMachines})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-300 py-3 px-4">Make</th>
                  <th className="text-left text-slate-300 py-3 px-4">Model</th>
                  <th className="text-left text-slate-300 py-3 px-4">Track Sizes</th>
                  <th className="text-left text-slate-300 py-3 px-4">Status</th>
                  <th className="text-right text-slate-300 py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 100).map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-4 text-white font-medium">{entry.make}</td>
                    <td className="py-3 px-4 text-slate-300">{entry.model}</td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="text-sm">
                        {entry.track_sizes.join(', ')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        entry.is_active 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {entry.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleEdit(entry)}
                          className="bg-blue-500 hover:bg-blue-600 h-8 px-3"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(entry.id)}
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
            {filteredData.length > 100 && (
              <div className="text-center text-slate-400 py-4">
                Showing first 100 entries. Use search to find specific machines.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCompatibility;
