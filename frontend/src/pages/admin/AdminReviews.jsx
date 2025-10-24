import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Trash2, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { toast } from '../../hooks/use-toast';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/api/admin/reviews`, { headers: { Authorization: `Bearer ${token}` } });
      setReviews(response.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch reviews", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`${API}/api/admin/reviews/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Success", description: "Review approved" });
      fetchReviews();
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/admin/reviews/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Success", description: "Review deleted" });
      fetchReviews();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (filter === 'pending') return !r.is_approved;
    if (filter === 'approved') return r.is_approved;
    return true;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Product Reviews</h1>
        <p className="text-slate-400 mt-2">Approve, reject, or delete customer reviews</p>
      </div>
      <div className="flex gap-3 mb-6">
        <Button onClick={() => setFilter('all')} className={filter === 'all' ? 'bg-orange-500' : 'bg-slate-700'}>All ({reviews.length})</Button>
        <Button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'bg-orange-500' : 'bg-slate-700'}>Pending ({reviews.filter(r => !r.is_approved).length})</Button>
        <Button onClick={() => setFilter('approved')} className={filter === 'approved' ? 'bg-orange-500' : 'bg-slate-700'}>Approved ({reviews.filter(r => r.is_approved).length})</Button>
      </div>
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          {loading ? <p className="text-slate-400 text-center py-8">Loading...</p> : filteredReviews.length === 0 ? <p className="text-slate-400 text-center py-8">No reviews found</p> : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="border border-slate-800 rounded-lg p-4 bg-slate-800/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold">{review.customer_name}</span>
                        {review.is_verified && <span className="text-xs bg-blue-600 px-2 py-1 rounded">Verified</span>}
                        {review.is_approved ? <span className="text-xs bg-green-600 px-2 py-1 rounded">Approved</span> : <span className="text-xs bg-yellow-600 px-2 py-1 rounded">Pending</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-600'}`} />
                        ))}
                        <span className="text-slate-400 text-sm ml-2">{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!review.is_approved && <Button size="sm" onClick={() => handleApprove(review.id)} className="bg-green-600 hover:bg-green-700"><CheckCircle className="h-4 w-4" /></Button>}
                      <Button size="sm" onClick={() => handleDelete(review.id)} className="bg-red-600 hover:bg-red-700"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <h3 className="text-white font-semibold mb-2">{review.title}</h3>
                  <p className="text-slate-300 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReviews;