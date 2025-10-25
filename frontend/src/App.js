import './App.css';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import BrandsPage from './pages/BrandsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ModelPage from './pages/ModelPage';
import FAQPage from './pages/FAQPage';
import BlogListPage from './pages/BlogListPage';
import BlogDetailPage from './pages/BlogDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminBrands from './pages/admin/AdminBrands';
import AdminMachineModels from './pages/admin/AdminMachineModels';
import AdminCategories from './pages/admin/AdminCategories';
import AdminPages from './pages/admin/AdminPages';
import AdminSections from './pages/admin/AdminSections';
import AdminRedirects from './pages/admin/AdminRedirects';
import AdminReviews from './pages/admin/AdminReviews';
import AdminFAQs from './pages/admin/AdminFAQs';
import AdminBlogCategories from './pages/admin/AdminBlogCategories';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminMessages from './pages/admin/AdminMessages';
import { Toaster } from './components/ui/toaster';

function App() {
  // Admin routes fixed - React Router v7 compatibility - v1.1
  // Build timestamp: 2025-01-24T20:45:00Z
  return (
    <HelmetProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<><Navbar /><HomePage /><Footer /></>} />
            <Route path="/products" element={<><Navbar /><ProductsPage /><Footer /></>} />
            <Route path="/product/:id" element={<><Navbar /><ProductDetailPage /><Footer /></>} />
            <Route path="/brands" element={<><Navbar /><BrandsPage /><Footer /></>} />
            <Route path="/about" element={<><Navbar /><AboutPage /><Footer /></>} />
            <Route path="/contact" element={<><Navbar /><ContactPage /><Footer /></>} />
            <Route path="/models/:brand/:model" element={<><Navbar /><ModelPage /><Footer /></>} />
            <Route path="/faqs" element={<><Navbar /><FAQPage /><Footer /></>} />
            <Route path="/blog" element={<><Navbar /><BlogListPage /><Footer /></>} />
            <Route path="/blog/:slug" element={<><Navbar /><BlogDetailPage /><Footer /></>} />
            
            {/* Admin Login - Standalone Route */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            
            {/* Admin Panel Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="brands" element={<AdminBrands />} />
              <Route path="machine-models" element={<AdminMachineModels />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="pages" element={<AdminPages />} />
              <Route path="sections" element={<AdminSections />} />
              <Route path="redirects" element={<AdminRedirects />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="faqs" element={<AdminFAQs />} />
              <Route path="blog-categories" element={<AdminBlogCategories />} />
              <Route path="blogs" element={<AdminBlogs />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="messages" element={<AdminMessages />} />
            </Route>

            {/* 404 - MUST BE LAST */}
            <Route path="*" element={<><Navbar /><NotFoundPage /><Footer /></>} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </div>
    </HelmetProvider>
  );
}

export default App;
