import React, { useEffect, useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { toast } from '../../hooks/use-toast';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/api/admin/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API}/api/admin/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Success", description: "Message deleted" });
      fetchMessages();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Contact Messages</h1>
        <p className="text-slate-400 mt-2">View and manage customer inquiries</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          {loading ? (
            <p className="text-slate-400 text-center py-8">Loading messages...</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg mb-2">No messages yet</p>
              <p className="text-slate-500 text-sm">Customer messages from contact form will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="border border-slate-800 rounded-lg p-4 bg-slate-800/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-white font-semibold">{message.name}</h3>
                      <p className="text-slate-400 text-sm">{message.email}</p>
                      {message.phone && <p className="text-slate-400 text-sm">{message.phone}</p>}
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs text-slate-500">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                      <Button size="sm" onClick={() => handleDelete(message.id)} className="bg-red-600 hover:bg-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="border-t border-slate-700 pt-3 mt-3">
                    <p className="text-slate-300">{message.message}</p>
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

export default AdminMessages;