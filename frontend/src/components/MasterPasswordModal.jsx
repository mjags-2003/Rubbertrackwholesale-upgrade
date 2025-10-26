import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Lock } from 'lucide-react';

const MasterPasswordModal = ({ isOpen, onClose, onSuccess, action }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const MASTER_PASSWORD = 'TRACKS2024MASTER'; // Your master password

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple delay to simulate verification
    setTimeout(() => {
      if (password === MASTER_PASSWORD) {
        setPassword('');
        setError('');
        setLoading(false);
        onSuccess();
      } else {
        setError('Incorrect master password. Please contact the administrator.');
        setLoading(false);
        setPassword('');
      }
    }, 500);
  };

  const handleCancel = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] p-4">
      <Card className="bg-slate-800 border-red-500 max-w-md w-full">
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="text-white flex items-center gap-3">
            <Lock className="h-6 w-6 text-red-500" />
            Master Password Required
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm font-semibold mb-2">
              🔒 Protected Operation
            </p>
            <p className="text-slate-300 text-sm">
              You are attempting to <strong className="text-red-400">{action}</strong>.
              This action requires master password authorization.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2 font-semibold">
                Enter Master Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-700 border-2 border-red-500 text-white rounded-md px-4 py-3 text-lg focus:outline-none focus:border-red-400"
                placeholder="Master password..."
                autoFocus
                required
              />
              {error && (
                <div className="mt-2 text-red-400 text-sm font-semibold">
                  ❌ {error}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading || !password}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold"
              >
                {loading ? 'Verifying...' : 'Authorize'}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                className="bg-slate-700 hover:bg-slate-600"
              >
                Cancel
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-400 text-center">
              Contact administrator if you need master password access
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterPasswordModal;
