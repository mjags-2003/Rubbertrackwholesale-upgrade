import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { toast } from '../hooks/use-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    machineModel: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: '', email: '', phone: '', machineModel: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="bg-slate-900 py-20 border-b border-slate-800">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-slate-300 text-xl max-w-3xl mx-auto">
            Have questions? Need a quote? Our expert team is ready to help you find the right parts for your equipment.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Call Us</h3>
                    <p className="text-slate-300 mb-1">1-800-RUBBER-TRACK</p>
                    <p className="text-slate-400 text-sm">Monday - Friday: 8AM - 6PM EST</p>
                    <p className="text-slate-400 text-sm">Saturday: 9AM - 3PM EST</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Email Us</h3>
                    <a href="mailto:quotes@rubbertrackwholesale.com" className="text-orange-500 hover:text-orange-400">
                      quotes@rubbertrackwholesale.com
                    </a>
                    <p className="text-slate-400 text-sm mt-1">We respond within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Our Locations</h3>
                    <p className="text-slate-300 mb-1">7 Warehouses Nationwide</p>
                    <p className="text-slate-400 text-sm">Serving all 50 states with fast shipping</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-white mb-3">Need Immediate Help?</h3>
                <p className="text-white/90 mb-4">Call us now for instant support and expert advice on finding the right parts.</p>
                <a href="tel:1-800-RUBBER-TRACK">
                  <Button className="w-full bg-white text-orange-600 hover:bg-slate-100">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-300 mb-2 font-medium">
                        Name *
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="bg-slate-800 border-slate-700 text-slate-200"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-2 font-medium">
                        Email *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-slate-800 border-slate-700 text-slate-200"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-300 mb-2 font-medium">
                        Phone
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="bg-slate-800 border-slate-700 text-slate-200"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-2 font-medium">
                        Machine Model
                      </label>
                      <Input
                        type="text"
                        name="machineModel"
                        value={formData.machineModel}
                        onChange={handleChange}
                        className="bg-slate-800 border-slate-700 text-slate-200"
                        placeholder="e.g., Bobcat T190"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2 font-medium">
                      Message *
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="bg-slate-800 border-slate-700 text-slate-200 resize-none"
                      placeholder="Tell us about your needs, questions, or provide details about the parts you're looking for..."
                    />
                  </div>

                  <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6">
                    <Send className="h-5 w-5 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="bg-slate-900 border-slate-800 mt-8">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-1">What information do I need to order?</h4>
                    <p className="text-slate-400 text-sm">We need your machine make, model, and year. If you know your track size or part number, that helps too!</p>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">How long does shipping take?</h4>
                    <p className="text-slate-400 text-sm">Most orders ship same-day and arrive within 1-3 business days. Free shipping on orders over $500.</p>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Do you offer warranties?</h4>
                    <p className="text-slate-400 text-sm">Yes! All rubber tracks come with a 1-year warranty, and undercarriage parts have a 6-month warranty.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
