import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { toast } from '../../hooks/use-toast';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Orders Management</h1>
        <p className="text-slate-400 mt-2">View and manage customer orders</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          {loading ? (
            <p className="text-slate-400 text-center py-8">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg mb-2">No orders yet</p>
              <p className="text-slate-500 text-sm">Orders will appear here when customers make purchases</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left p-4 text-slate-300">Order #</th>
                    <th className="text-left p-4 text-slate-300">Customer</th>
                    <th className="text-left p-4 text-slate-300">Total</th>
                    <th className="text-left p-4 text-slate-300">Status</th>
                    <th className="text-left p-4 text-slate-300">Date</th>
                    <th className="text-right p-4 text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="p-4 text-white font-medium">{order.order_number}</td>
                      <td className="p-4 text-slate-400">{order.customer_name}</td>
                      <td className="p-4 text-white">${order.total_amount?.toFixed(2)}</td>
                      <td className="p-4">
                        <span className="text-sm bg-blue-600 px-2 py-1 rounded">{order.status}</span>
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
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

export default AdminOrders;