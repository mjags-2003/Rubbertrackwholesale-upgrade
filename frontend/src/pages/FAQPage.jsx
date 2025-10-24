import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await axios.get(`${API}/api/faqs`);
      setFaqs(response.data);
      const uniqueCategories = [...new Set(response.data.map(f => f.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to fetch FAQs');
    }
  };

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(f => f.category === selectedCategory);

  // Generate FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": filteredFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions - Rubber Tracks & Parts | FAQ</title>
        <meta name="description" content="Find answers to common questions about rubber tracks, sprockets, idlers, and rollers. Expert advice on sizing, fitment, and maintenance." />
        <meta name="keywords" content="rubber tracks FAQ, track sizing, fitment questions, maintenance tips, sprocket FAQ, idler FAQ" />
        <link rel="canonical" href={`${window.location.origin}/faqs`} />
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 py-12 border-b border-slate-800">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-slate-300">Find answers to common questions about rubber tracks and undercarriage parts</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex gap-3 mb-8 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All ({faqs.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat} ({faqs.filter(f => f.category === cat).length})
                </button>
              ))}
            </div>
          )}

          {/* FAQ List */}
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredFaqs.length === 0 ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-400">No FAQs found for this category.</p>
                </CardContent>
              </Card>
            ) : (
              filteredFaqs.map((faq, index) => (
                <Card key={faq.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                      className="w-full text-left p-6 flex justify-between items-start gap-4"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{faq.question}</h3>
                        {faq.category && (
                          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">
                            {faq.category}
                          </span>
                        )}
                      </div>
                      <div className="text-orange-500">
                        {openIndex === index ? (
                          <ChevronUp className="h-6 w-6" />
                        ) : (
                          <ChevronDown className="h-6 w-6" />
                        )}
                      </div>
                    </button>
                    {openIndex === index && (
                      <div className="px-6 pb-6">
                        <div className="border-t border-slate-800 pt-4">
                          <p className="text-slate-300 whitespace-pre-wrap">{faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-slate-900 border-t border-slate-800 py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Still Have Questions?</h2>
            <p className="text-slate-300 mb-6">Our team is here to help you find the right parts</p>
            <a href="/contact">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-md transition-colors">
                Contact Us
              </button>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQPage;