import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Tag, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/blogs/slug/${slug}`);
      setBlog(response.data);
    } catch (error) {
      console.error('Failed to fetch blog');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Blog Not Found</h1>
          <Link to="/blog" className="text-orange-500 hover:underline">Back to Blog</Link>
        </div>
      </div>
    );
  }

  // Generate Blog Schema for SEO
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.excerpt || blog.meta_description,
    "image": blog.featured_image,
    "datePublished": blog.published_at || blog.created_at,
    "dateModified": blog.updated_at,
    "author": {
      "@type": "Person",
      "name": blog.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Rubber Track Wholesale",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/logo.png`
      }
    },
    "keywords": blog.tags?.join(', ')
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": window.location.origin },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${window.location.origin}/blog` },
      { "@type": "ListItem", "position": 3, "name": blog.title, "item": window.location.href }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{blog.meta_title || blog.title}</title>
        <meta name="description" content={blog.meta_description || blog.excerpt || ''} />
        <meta name="keywords" content={blog.meta_keywords?.join(', ') || blog.tags?.join(', ') || ''} />
        <link rel="canonical" href={`${window.location.origin}/blog/${blog.slug}`} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt || ''} />
        <meta property="og:image" content={blog.featured_image || ''} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={blog.excerpt || ''} />
        <meta name="twitter:image" content={blog.featured_image || ''} />
        <script type="application/ld+json">{JSON.stringify(blogSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        {/* Breadcrumbs */}
        <div className="bg-slate-900 border-b border-slate-800">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-slate-400 hover:text-orange-500">Home</Link>
              <ChevronRight className="h-4 w-4 text-slate-600" />
              <Link to="/blog" className="text-slate-400 hover:text-orange-500">Blog</Link>
              <ChevronRight className="h-4 w-4 text-slate-600" />
              <span className="text-white font-medium truncate">{blog.title}</span>
            </nav>
          </div>
        </div>

        {/* Featured Image */}
        {blog.featured_image && (
          <div className="container mx-auto px-4 py-8">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full max-w-4xl mx-auto h-96 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Blog Content */}
        <div className="container mx-auto px-4 py-8">
          <article className="max-w-4xl mx-auto">
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{blog.title}</h1>
              <div className="flex items-center gap-4 text-slate-400 mb-4">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(blog.published_at || blog.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {blog.author}
                </span>
              </div>
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {blog.tags.map(tag => (
                    <span key={tag} className="text-sm bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <div 
              className="prose prose-invert prose-lg max-w-none
                prose-headings:text-white prose-p:text-slate-300 
                prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white prose-code:text-orange-400
                prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800
                prose-img:rounded-lg prose-img:shadow-lg
                prose-ul:text-slate-300 prose-ol:text-slate-300
                prose-li:text-slate-300"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </article>
        </div>

        {/* Related/CTA Section */}
        <div className="bg-slate-900 border-t border-slate-800 py-12 mt-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Find Your Parts?</h2>
            <p className="text-slate-300 mb-6">Browse our complete catalog of rubber tracks and undercarriage parts</p>
            <Link to="/products">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-md transition-colors">
                Shop All Products
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetailPage;