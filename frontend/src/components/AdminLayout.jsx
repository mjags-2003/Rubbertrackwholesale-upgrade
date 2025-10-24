import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, FolderOpen, ShoppingCart, Users, MessageSquare, LogOut, FileText, Repeat, Star, HelpCircle, FolderTree, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/button';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/brands', label: 'Brands', icon: Tag },
    { path: '/admin/categories', label: 'Categories', icon: FolderOpen },
    { path: '/admin/pages', label: 'Pages (CMS)', icon: FileText },
    { path: '/admin/blog-categories', label: 'Blog Categories', icon: FolderTree },
    { path: '/admin/blogs', label: 'Blogs', icon: BookOpen },
    { path: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
    { path: '/admin/reviews', label: 'Reviews', icon: Star },
    { path: '/admin/redirects', label: '301 Redirects', icon: Repeat },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Rubber Track Wholesale</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-orange-500 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
