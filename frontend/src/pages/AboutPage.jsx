import React from 'react';
import { Truck, Award, Users, MapPin } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section 
        className="bg-slate-900 py-20 border-b border-slate-800 bg-cover bg-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)), url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&h=600&fit=crop')`
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">About Us</h1>
          <p className="text-slate-300 text-xl max-w-3xl mx-auto">
            Your trusted partner for premium rubber tracks and undercarriage parts since 2010
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Mission */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-white mb-6 text-center">Our Mission</h2>
          <p className="text-slate-300 text-lg leading-relaxed text-center">
            At Rubber Track Wholesale, we're committed to providing contractors, construction companies, and equipment owners with the highest quality aftermarket rubber tracks and undercarriage parts at wholesale prices. We combine premium products with exceptional customer service and fast nationwide shipping to keep your equipment running smoothly.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">15+</div>
              <p className="text-slate-300">Years in Business</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">10K+</div>
              <p className="text-slate-300">Happy Customers</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">7</div>
              <p className="text-slate-300">Warehouses</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6 text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">99%</div>
              <p className="text-slate-300">Customer Satisfaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose Us */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white mb-8 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Premium Quality</h3>
                    <p className="text-slate-300">
                      All our rubber tracks meet or exceed OEM specifications. We use reinforced steel cords and premium rubber compounds for maximum durability and longevity.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Fast Shipping</h3>
                    <p className="text-slate-300">
                      With 7 strategically located warehouses across the country, we can ship your order same-day and deliver within 1-3 business days to most locations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Expert Support</h3>
                    <p className="text-slate-300">
                      Our knowledgeable team has decades of combined experience in heavy equipment parts. We're here to help you find the perfect fit for your machine.
                    </p>
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
                    <h3 className="text-xl font-bold text-white mb-2">Nationwide Coverage</h3>
                    <p className="text-slate-300">
                      We serve customers across all 50 states with free shipping on qualifying orders. From small contractors to large construction firms, we've got you covered.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Our Story */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6">Our Story</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
            <div className="text-slate-300 space-y-4 leading-relaxed">
              <p>
                Rubber Track Wholesale was founded in 2010 by a team of heavy equipment operators and mechanics who understood the challenges of finding quality aftermarket parts at fair prices. What started as a small operation serving local contractors has grown into one of the nation's leading suppliers of rubber tracks and undercarriage parts.
              </p>
              <p>
                Over the years, we've built strong relationships with manufacturers and distributors worldwide, allowing us to offer premium products at wholesale prices. Our growth has been driven by our commitment to three core principles: quality products, exceptional service, and honest pricing.
              </p>
              <p>
                Today, we operate 7 warehouses strategically located across the United States, maintaining extensive inventory to ensure fast delivery. We've served over 10,000 satisfied customers, from individual equipment owners to large fleet operators and construction companies.
              </p>
              <p>
                As we continue to grow, our focus remains the same: providing our customers with the best rubber tracks and undercarriage parts, backed by knowledgeable support and reliable service. We're proud to be your trusted partner in keeping your equipment running strong.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
