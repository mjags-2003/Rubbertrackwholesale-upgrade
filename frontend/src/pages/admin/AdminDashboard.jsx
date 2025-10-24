import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Package, ShoppingCart, Users, Mail } from 'lucide-react';
import axios from 'axios';
import { toast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      } else {
        toast({
          title: "Error",
          description: "Failed to load dashboard stats",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Products</p>
                <p className="text-3xl font-bold text-white mt-2">{stats?.total_products || 0}</p>
              </div>
              <Package className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-white mt-2">{stats?.total_orders || 0}</p>
              </div>
              <ShoppingCart className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Customers</p>
                <p className="text-3xl font-bold text-white mt-2">{stats?.total_customers || 0}</p>
              </div>
              <Users className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Unread Messages</p>
                <p className="text-3xl font-bold text-white mt-2">{stats?.unread_messages || 0}</p>
              </div>
              <Mail className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      {stats?.recent_orders && stats.recent_orders.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent_orders.map((order) => (
                <div key={order.id} className="flex justify-between items-center border-b border-slate-700 pb-4">
                  <div>
                    <p className="text-white font-semibold">{order.order_number}</p>
                    <p className="text-slate-400 text-sm">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">${order.total.toFixed(2)}</p>
                    <p className="text-slate-400 text-sm capitalize">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
