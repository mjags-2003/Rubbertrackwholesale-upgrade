import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import AdminCategories from './pages/admin/AdminCategories';
import AdminPages from './pages/admin/AdminPages';
import AdminRedirects from './pages/admin/AdminRedirects';
import AdminReviews from './pages/admin/AdminReviews';
import AdminFAQs from './pages/admin/AdminFAQs';
import AdminBlogCategories from './pages/admin/AdminBlogCategories';
import AdminBlogs from './pages/admin/AdminBlogs';
import { Toaster } from './components/ui/toaster';

function App() {
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
            <Route path="*" element={<><Navbar /><NotFoundPage /><Footer /></>} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="brands" element={<AdminBrands />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="pages" element={<AdminPages />} />
              <Route path="redirects" element={<AdminRedirects />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="faqs" element={<AdminFAQs />} />
              <Route path="blog-categories" element={<AdminBlogCategories />} />
              <Route path="blogs" element={<AdminBlogs />} />
            </Route>
          </Routes>
          <Toaster />
        </BrowserRouter>
      </div>
    </HelmetProvider>
  );
}

export default App;
