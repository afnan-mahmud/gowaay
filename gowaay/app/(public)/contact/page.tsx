'use client';

import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Phone, Mail, MapPin } from 'lucide-react';

export default function ContactPage() {
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/+8801611553628', '_blank');
  };

  return (
    <Layout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
          <p className="text-gray-600">Get in touch with our support team</p>
        </div>

        {/* Contact Methods */}
        <div className="space-y-4">
          {/* WhatsApp */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">WhatsApp</h3>
                  <p className="text-gray-600">+880 1820 500747</p>
                  <p className="text-sm text-gray-500">Available 24/7</p>
                </div>
                <Button onClick={handleWhatsAppClick} className="bg-green-500 hover:bg-green-600">
                  Chat Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Phone */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Phone</h3>
                  <p className="text-gray-600">+880 1820 500747</p>
                  <p className="text-sm text-gray-500">Mon-Fri 9AM-6PM</p>
                </div>
                <Button variant="outline" onClick={() => window.open('tel:+8801611553628')}>
                  Call Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Email</h3>
                  <p className="text-gray-600">support@gowaay.com</p>
                  <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                </div>
                <Button variant="outline" onClick={() => window.open('mailto:support@gowaay.com')}>
                  Send Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Office</h3>
                  <p className="text-gray-600">Dhaka, Bangladesh</p>
                  <p className="text-sm text-gray-500">Visit us during business hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">How do I book a room?</h4>
              <p className="text-sm text-gray-600">
                Simply search for rooms, select your dates and guests, then proceed to payment. 
                You'll receive a confirmation email once your booking is confirmed.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Can I cancel my booking?</h4>
              <p className="text-sm text-gray-600">
                Yes, you can cancel your booking up to 24 hours before check-in. 
                Please check our cancellation policy for more details.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">How do I contact the host?</h4>
              <p className="text-sm text-gray-600">
                Once you've made a booking, you can message the host directly through our platform 
                or use the contact information provided in your booking confirmation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Is my payment secure?</h4>
              <p className="text-sm text-gray-600">
                Yes, all payments are processed through SSLCOMMERZ, a secure payment gateway 
                that uses industry-standard encryption to protect your financial information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
