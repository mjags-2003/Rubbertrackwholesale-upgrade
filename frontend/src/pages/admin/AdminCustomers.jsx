import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { toast } from '../../hooks/use-toast';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/api/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Customers Management</h1>
        <p className="text-slate-400 mt-2">View and manage customer accounts</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          {loading ? (
            <p className="text-slate-400 text-center py-8">Loading customers...</p>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg mb-2">No customers yet</p>
              <p className="text-slate-500 text-sm">Customer accounts will appear here when they register</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-4 text-slate-300">Name</th>
                    <th className="text-left p-4 text-slate-300">Email</th>
                    <th className="text-left p-4 text-slate-300">Phone</th>
                    <th className="text-left p-4 text-slate-300">Joined</th>
                    <th className="text-right p-4 text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="p-4 text-white font-medium">{customer.name}</td>
                      <td className="p-4 text-slate-400">{customer.email}</td>
                      <td className="p-4 text-slate-400">{customer.phone || '—'}</td>
                      <td className="p-4 text-slate-400 text-sm">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-end">
                          <button className="text-blue-500 hover:text-blue-400">
                            <Eye className="h-4 w-4" />
                          </button>
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

export default AdminCustomers;