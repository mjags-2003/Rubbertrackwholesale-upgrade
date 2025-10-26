import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Search, Plus, Edit2, Trash2, Save, X, Upload, Download } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AdminPartNumbers = () => {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [partNumbers, setPartNumbers] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [selectedPartType, setSelectedPartType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingPart, setEditingPart] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [newPart, setNewPart] = useState({
    brand: '',
    part_number: '',
    part_type: 'roller',
    part_subtype: '',
    product_name: '',
    compatible_models: '',
    price: ''
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      fetchPartNumbers();
    }
  }, [selectedBrand]);

  useEffect(() => {
    filterParts();
  }, [partNumbers, selectedPartType, searchTerm]);

  const fetchBrands = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/api/admin/part-numbers/brands`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBrands(response.data);
      if (response.data.length > 0) {
        setSelectedBrand(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const fetchPartNumbers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/api/admin/part-numbers?brand=${selectedBrand}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPartNumbers(response.data);
    } catch (error) {
      console.error('Failed to fetch part numbers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterParts = () => {
    let filtered = [...partNumbers];

    if (selectedPartType !== 'all') {
      filtered = filtered.filter(part => part.part_type === selectedPartType);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(part =>
        part.part_number.toLowerCase().includes(searchLower) ||
        part.product_name.toLowerCase().includes(searchLower) ||
        part.compatible_models.some(model => model.toLowerCase().includes(searchLower))
      );
    }

    setFilteredParts(filtered);
  };

  const handleSavePrice = async (partId, newPrice) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(
        `${API}/api/admin/part-numbers/${partId}`,
        { price: parseFloat(newPrice) || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setPartNumbers(partNumbers.map(part =>
        part.id === partId ? { ...part, price: parseFloat(newPrice) || null } : part
      ));
      setEditingPart(null);
      alert('Price updated successfully!');
    } catch (error) {
      console.error('Failed to update price:', error);
      alert('Failed to update price');
    }
  };

  const handleToggleStock = async (partId, currentStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(
        `${API}/api/admin/part-numbers/${partId}`,
        { is_in_stock: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setPartNumbers(partNumbers.map(part =>
        part.id === partId ? { ...part, is_in_stock: !currentStatus } : part
      ));
      alert(`Item marked as ${!currentStatus ? 'IN STOCK' : 'OUT OF STOCK'}`);
    } catch (error) {
      console.error('Failed to update stock status:', error);
      alert('Failed to update stock status');
    }
  };

  const handleDeletePart = async (partId) => {
    if (!window.confirm('Are you sure you want to delete this part number?')) return;

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/admin/part-numbers/${partId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPartNumbers(partNumbers.filter(part => part.id !== partId));
      alert('Part number deleted successfully!');
    } catch (error) {
      console.error('Failed to delete part:', error);
      alert('Failed to delete part number');
    }
  };

  const handleAddPart = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const compatible = newPart.compatible_models.split(',').map(m => m.trim()).filter(m => m);
      
      await axios.post(
        `${API}/api/admin/part-numbers`,
        {
          ...newPart,
          compatible_models: compatible,
          price: newPart.price ? parseFloat(newPart.price) : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Part added successfully!');
      setShowAddForm(false);
      setNewPart({
        brand: '',
        part_number: '',
        part_type: 'roller',
        part_subtype: '',
        product_name: '',
        compatible_models: '',
        price: ''
      });
      fetchPartNumbers();
    } catch (error) {
      console.error('Failed to add part:', error);
      alert('Failed to add part: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleCSVUpload = async () => {
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const token = localStorage.getItem('admin_token');
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < 4) continue;
        
        const part = {
          brand: values[0] || '',
          part_number: values[1] || '',
          part_type: values[2]?.toLowerCase() || 'roller',
          part_subtype: values[3] || null,
          product_name: values[4] || '',
          compatible_models: values[5] ? values[5].split(';').map(m => m.trim()) : [],
          price: values[6] ? parseFloat(values[6]) : null
        };
        
        try {
          await axios.post(`${API}/api/admin/part-numbers`, part, {
            headers: { Authorization: `Bearer ${token}` }
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to import row ${i}:`, error);
          errorCount++;
        }
      }
      
      alert(`CSV Import Complete!\nSuccess: ${successCount}\nErrors: ${errorCount}`);
      setShowCSVUpload(false);
      setCsvFile(null);
      fetchBrands();
      fetchPartNumbers();
    } catch (error) {
      console.error('Failed to process CSV:', error);
      alert('Failed to process CSV file');
    }
  };

  const downloadCSVTemplate = () => {
    const template = `brand,part_number,part_type,part_subtype,product_name,compatible_models,price
Kubota,68493-21700,roller,bottom,Fits: Kubota KH151 KH191 KX151 Roller,KH151;KH191;KX151,
Kubota,68621-14430,sprocket,,Fits: Kubota KX 91-2 Sprocket,KX 91-2,
Kubota,69191-21300,idler,front,Fits: Kubota K008-3 U10-3 Tension Idler,K008-3;U10-3,`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'part_numbers_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPartTypeColor = (partType) => {
    switch (partType) {
      case 'roller': return 'bg-blue-100 text-blue-800';
      case 'sprocket': return 'bg-green-100 text-green-800';
      case 'idler': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPartSubtypeBadge = (subtype) => {
    if (!subtype) return null;
    return (
      <span className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-200 text-gray-700">
        {subtype}
      </span>
    );
  };

  // Group parts by type
  const groupedParts = {
    roller: filteredParts.filter(p => p.part_type === 'roller'),
    sprocket: filteredParts.filter(p => p.part_type === 'sprocket'),
    idler: filteredParts.filter(p => p.part_type === 'idler')
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Part Numbers Management</h1>
          <p className="text-gray-600 mt-2">Manage rollers, sprockets & idlers by brand</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadCSVTemplate} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download CSV Template
          </Button>
          <Button onClick={() => setShowCSVUpload(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Part Manually
          </Button>
        </div>
      </div>

      {/* CSV Upload Modal */}
      {showCSVUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Import Parts from CSV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a CSV file with columns: brand, part_number, part_type, part_subtype, product_name, compatible_models (semicolon-separated), price
                  </p>
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setShowCSVUpload(false); setCsvFile(null); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCSVUpload}>
                    Upload & Import
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manual Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <Card className="w-full max-w-2xl m-4">
            <CardHeader>
              <CardTitle>Add Part Number Manually</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Brand</label>
                  <Input
                    value={newPart.brand}
                    onChange={(e) => setNewPart({...newPart, brand: e.target.value})}
                    placeholder="e.g., Kubota"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Part Number</label>
                  <Input
                    value={newPart.part_number}
                    onChange={(e) => setNewPart({...newPart, part_number: e.target.value})}
                    placeholder="e.g., 68493-21700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Part Type</label>
                  <Select value={newPart.part_type} onValueChange={(val) => setNewPart({...newPart, part_type: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="roller">Roller</SelectItem>
                      <SelectItem value="sprocket">Sprocket</SelectItem>
                      <SelectItem value="idler">Idler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Part Subtype (Optional)</label>
                  <Input
                    value={newPart.part_subtype}
                    onChange={(e) => setNewPart({...newPart, part_subtype: e.target.value})}
                    placeholder="e.g., bottom, top, front, rear"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Compatible With These Machines</label>
                  <Input
                    value={newPart.product_name}
                    onChange={(e) => setNewPart({...newPart, product_name: e.target.value})}
                    placeholder="e.g., Kubota KH151 KH191 KX151 Roller"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Compatible Models (comma-separated)</label>
                  <Input
                    value={newPart.compatible_models}
                    onChange={(e) => setNewPart({...newPart, compatible_models: e.target.value})}
                    placeholder="e.g., KH151, KH191, KX151"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price (Optional)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newPart.price}
                    onChange={(e) => setNewPart({...newPart, price: e.target.value})}
                    placeholder="e.g., 299.99"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => {
                  setShowAddForm(false);
                  setNewPart({
                    brand: '',
                    part_number: '',
                    part_type: 'roller',
                    part_subtype: '',
                    product_name: '',
                    compatible_models: '',
                    price: ''
                  });
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddPart}>
                  Add Part
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Brand Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Brand</label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Part Type Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Part Type</label>
              <Select value={selectedPartType} onValueChange={setSelectedPartType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="roller">Rollers</SelectItem>
                  <SelectItem value="sprocket">Sprockets</SelectItem>
                  <SelectItem value="idler">Idlers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by part number or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{filteredParts.length}</div>
            <div className="text-sm text-gray-600">Total Parts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{groupedParts.roller.length}</div>
            <div className="text-sm text-gray-600">Rollers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{groupedParts.sprocket.length}</div>
            <div className="text-sm text-gray-600">Sprockets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{groupedParts.idler.length}</div>
            <div className="text-sm text-gray-600">Idlers</div>
          </CardContent>
        </Card>
      </div>

      {/* Parts Table */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : filteredParts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No part numbers found for {selectedBrand}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedBrand} Parts ({filteredParts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Part Number</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Compatible With These Machines</th>
                    <th className="text-left p-3">Compatible Models</th>
                    <th className="text-left p-3">Price</th>
                    <th className="text-left p-3">In Stock</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.map(part => (
                    <tr key={part.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">{part.part_number}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPartTypeColor(part.part_type)}`}>
                          {part.part_type}
                        </span>
                        {getPartSubtypeBadge(part.part_subtype)}
                      </td>
                      <td className="p-3">{part.product_name}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {part.compatible_models.slice(0, 3).map((model, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                              {model}
                            </span>
                          ))}
                          {part.compatible_models.length > 3 && (
                            <span className="text-xs text-gray-500">+{part.compatible_models.length - 3} more</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {editingPart === part.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              defaultValue={part.price || ''}
                              placeholder="Enter price"
                              className="w-24"
                              id={`price-${part.id}`}
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                const input = document.getElementById(`price-${part.id}`);
                                handleSavePrice(part.id, input.value);
                              }}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingPart(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={part.price ? 'font-semibold' : 'text-gray-400'}>
                              {part.price ? `$${part.price.toFixed(2)}` : 'Not set'}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingPart(part.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleStock(part.id, part.is_in_stock)}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            part.is_in_stock 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                          }`}
                        >
                          {part.is_in_stock ? '✓ IN STOCK' : 'OUT OF STOCK'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeletePart(part.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPartNumbers;
