import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Upload, Download } from 'lucide-react';
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
import { machineModels } from '../../data/machineModels';

const API = process.env.REACT_APP_BACKEND_URL || '';

const AdminMachineModels = () => {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [brandCounts, setBrandCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [formData, setFormData] = useState({
    brand: '',
    model_name: '',
    full_name: '',
    description: '',
    product_image: ''
  });

  useEffect(() => {
    fetchBrands();
    fetchModels();
  }, [selectedBrand]);

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/api/admin/brands`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBrands(response.data);
    } catch (error) {
      console.error('Failed to fetch brands');
    }
  };

  const fetchModels = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const url = selectedBrand 
        ? `${API}/api/admin/machine-models?brand=${selectedBrand}`
        : `${API}/api/admin/machine-models`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModels(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch machine models",
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
      const url = editingModel 
        ? `${API}/api/admin/machine-models/${editingModel.id}`
        : `${API}/api/admin/machine-models`;
      
      const method = editingModel ? 'put' : 'post';

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Success",
        description: `Machine model ${editingModel ? 'updated' : 'created'} successfully`
      });

      setDialogOpen(false);
      resetForm();
      fetchModels();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to save machine model",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (modelId) => {
    if (!window.confirm('Are you sure you want to delete this machine model?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/admin/machine-models/${modelId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: "Success", description: "Machine model deleted successfully" });
      fetchModels();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete machine model",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (model) => {
    setEditingModel(model);
    setFormData({
      brand: model.brand || '',
      model_name: model.model_name || '',
      full_name: model.full_name || '',
      description: model.description || '',
      product_image: model.product_image || ''
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingModel(null);
    setFormData({
      brand: '',
      model_name: '',
      full_name: '',
      description: '',
      product_image: ''
    });
  };

  const handleBulkImport = async () => {
    console.log("Import button clicked!");
    alert("Import starting - this will take 5-10 minutes. Please be patient!");
    if (!window.confirm('This will import ALL machine models from machineModels.js. This may take 5-10 minutes. Continue?')) return;

    setLoading(true);
    toast({
      title: "Import Started",
      description: "Importing models... This may take several minutes. Please wait."
    });

    try {
      const token = localStorage.getItem('admin_token');
      let imported = 0;
      let skipped = 0;
      let totalModels = 0;
      
      // Count total models
      for (const modelList of Object.values(machineModels)) {
        totalModels += modelList.length;
      }

      let processed = 0;

      // Import models for each brand
      for (const [brand, modelList] of Object.entries(machineModels)) {
        // Process in batches of 10
        for (let i = 0; i < modelList.length; i++) {
          const modelName = modelList[i];
          try {
            await axios.post(`${API}/api/admin/machine-models`, {
              brand: brand,
              model_name: modelName,
              full_name: `${brand} ${modelName}`
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            imported++;
          } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.detail?.includes('already exists')) {
              skipped++;
            }
          }
          
          processed++;
          
          // Show progress every 50 models
          if (processed % 50 === 0) {
            toast({
              title: "Import Progress",
              description: `Processed ${processed} of ${totalModels} models...`
            });
          }
        }
      }

      toast({
        title: "Bulk Import Complete!",
        description: `Imported ${imported} models, skipped ${skipped} existing models`
      });

      fetchModels();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import machine models",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Brand', 'Model Name', 'Full Name', 'Description', 'Image URL'];
    const rows = models.map(m => [
      m.brand,
      m.model_name,
      m.full_name || '',
      m.description || '',
      m.product_image || ''
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `machine_models_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Machine Models Management</h1>
          <p className="text-slate-400 mt-2">Manage machine models for all brands</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportToCSV} disabled={models.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleBulkImport} disabled={loading}>
            <Upload className="h-4 w-4 mr-2" />
            {loading ? 'Importing... Please Wait' : 'Import from Code'}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Model
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingModel ? 'Edit Machine Model' : 'Add New Machine Model'}</DialogTitle>
                <DialogDescription className="text-slate-400">
                  {editingModel ? 'Update machine model details' : 'Add a new machine model'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Brand *</Label>
                    <select
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white"
                      required
                    >
                      <option value="">Select Brand</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.name}>{brand.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Model Name *</Label>
                    <Input
                      value={formData.model_name}
                      onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                      required
                      className="bg-slate-800 border-slate-700"
                      placeholder="e.g., T190, 317G, SVL95"
                    />
                  </div>
                </div>

                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    placeholder="Auto-generated if empty (e.g., Bobcat T190)"
                  />
                  <p className="text-xs text-slate-500 mt-1">Leave empty to auto-generate</p>
                </div>

                <div>
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <Label>Product Image URL</Label>
                  <Input
                    value={formData.product_image}
                    onChange={(e) => setFormData({ ...formData, product_image: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
                    {loading ? 'Saving...' : (editingModel ? 'Update Model' : 'Create Model')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter by Brand */}
      <Card className="bg-slate-900 border-slate-800 mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label className="text-white">Filter by Brand:</Label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-white"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.name}>{brand.name}</option>
              ))}
            </select>
            <span className="text-slate-400">
              Showing {models.length} models
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-800 mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold text-white mb-2">Quick Actions:</h3>
          <ul className="text-slate-300 space-y-1">
            <li>• <strong>Import from Code:</strong> Bulk import all models from machineModels.js</li>
            <li>• <strong>Export CSV:</strong> Download current models as CSV</li>
            <li>• <strong>Add Model:</strong> Manually add individual machine models</li>
            <li>• <strong>Filter:</strong> Use brand filter to view specific brand models</li>
          </ul>
        </CardContent>
      </Card>

      {/* Models List */}
      {loading && models.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Loading machine models...</div>
      ) : models.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-12 text-center text-slate-400">
            <p className="mb-4">No machine models found. Click "Import from Code" to get started!</p>
            <Button onClick={handleBulkImport} className="bg-orange-500 hover:bg-orange-600">
              <Upload className="h-4 w-4 mr-2" />
              Import All Models
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => (
            <Card key={model.id} className="bg-slate-900 border-slate-800 hover:border-orange-500/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <span className="text-xs text-orange-400 font-semibold">{model.brand}</span>
                    <h3 className="text-lg font-bold text-white">{model.model_name}</h3>
                    {model.full_name && model.full_name !== `${model.brand} ${model.model_name}` && (
                      <p className="text-sm text-slate-400">{model.full_name}</p>
                    )}
                    {model.description && (
                      <p className="text-sm text-slate-500 mt-1">{model.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(model)}>
                      <Edit className="h-4 w-4 text-slate-400 hover:text-orange-400" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDelete(model.id)}
                    >
                      <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-400" />
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

export default AdminMachineModels;
