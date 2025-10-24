import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Tag, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

const BlogListPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [page, selectedCategory]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = { limit: 12, skip: (page - 1) * 12 };
      if (selectedCategory) params.category_id = selectedCategory;
      const response = await axios.get(`${API}/api/blogs`, { params });
      setBlogs(response.data.blogs);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/api/blog-categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  return (
    <>
      <Helmet>
        <title>Blog - Rubber Tracks Tips, Maintenance & Industry News</title>
        <meta name="description" content="Expert tips, maintenance guides, and industry news about rubber tracks, sprockets, and undercarriage parts. Learn from professionals." />
        <meta name="keywords" content="rubber tracks blog, maintenance tips, industry news, track care, equipment tips" />
        <link rel="canonical" href={`${window.location.origin}/blog`} />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 py-12 border-b border-slate-800">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog & Resources</h1>
            <p className="text-xl text-slate-300">Expert tips, maintenance guides, and industry insights</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <Card className="bg-slate-900 border-slate-800 sticky top-4">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold mb-4">Categories</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => { setSelectedCategory(null); setPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        !selectedCategory 
                          ? 'bg-orange-500 text-white' 
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      All Posts
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          selectedCategory === cat.id 
                            ? 'bg-orange-500 text-white' 
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Blog Grid */}
            <div className="flex-1">
              {loading ? (
                <p className="text-slate-400 text-center py-12">Loading...</p>
              ) : blogs.length === 0 ? (
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-12 text-center">
                    <p className="text-slate-400 text-lg">No blog posts found</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map(blog => (
                      <Link key={blog.id} to={`/blog/${blog.slug}`}>
                        <Card className="bg-slate-900 border-slate-800 hover:border-orange-500 transition-all h-full">
                          <CardContent className="p-0">
                            {blog.featured_image && (
                              <img
                                src={blog.featured_image}
                                alt={blog.title}
                                className="w-full h-48 object-cover rounded-t-lg"
                              />
                            )}
                            <div className="p-6">
                              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                                {blog.title}
                              </h3>
                              {blog.excerpt && (
                                <p className="text-slate-400 text-sm mb-3 line-clamp-3">
                                  {blog.excerpt}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(blog.published_at || blog.created_at).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {blog.author}
                                </span>
                              </div>
                              {blog.tags && blog.tags.length > 0 && (
                                <div className="flex gap-2 mt-3 flex-wrap">
                                  {blog.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-slate-800 text-white rounded-md disabled:opacity-50 hover:bg-slate-700"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-slate-300">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-slate-800 text-white rounded-md disabled:opacity-50 hover:bg-slate-700"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogListPage;