'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadField } from '@/components/ui/UploadField';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Home, MapPin, Phone, User, FileText, Mail, Lock } from 'lucide-react';
import { api, ApiResponse } from '@/lib/api';

const hostApplicationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  whatsapp: z.string().min(10, 'Please enter a valid WhatsApp number'),
  location: z.string().min(5, 'Please enter a valid location'),
  mapLink: z.string().url('Please enter a valid map link'),
});

type HostApplicationForm = z.infer<typeof hostApplicationSchema>;

export default function JoinHostPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [nidFront, setNidFront] = useState<File | null>(null);
  const [nidBack, setNidBack] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HostApplicationForm>({
    resolver: zodResolver(hostApplicationSchema),
  });

  const onSubmit = async (data: HostApplicationForm) => {
    if (!nidFront || !nidBack) {
      alert('Please upload both NID front and back images');
      return;
    }

    try {
      setSubmitting(true);
      
      // Step 1: Upload NID images using public route
      console.log('Uploading NID images...');
      const [nidFrontResponse, nidBackResponse] = await Promise.all([
        api.uploads.image(nidFront, true), // Use public route
        api.uploads.image(nidBack, true), // Use public route
      ]);
      
      console.log('NID Front Response:', nidFrontResponse);
      console.log('NID Back Response:', nidBackResponse);

      if (!nidFrontResponse.success) {
        throw new Error(nidFrontResponse.error ?? 'Failed to upload NID front image');
      }

      if (!nidBackResponse.success) {
        // Clean up the first upload if the second fails
        try {
          await api.uploads.delete((nidFrontResponse.data as any).filename);
        } catch (cleanupError) {
          console.warn('Failed to cleanup first upload:', cleanupError);
        }
        throw new Error(nidBackResponse.error ?? 'Failed to upload NID back image');
      }

      // Step 2: Register user and create host profile in one step
      console.log('Registering user and creating host profile...');
      const registerResponse: ApiResponse = await api.auth.register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        isHost: true,
        hostData: {
          displayName: data.name,
          phone: data.phone,
          whatsapp: data.whatsapp,
          locationName: data.location,
          locationMapUrl: data.mapLink,
          nidFrontUrl: (nidFrontResponse.data as any).url,
          nidBackUrl: (nidBackResponse.data as any).url,
        }
      });
      
      console.log('Registration Response:', registerResponse);

      if (!registerResponse.success) {
        if (registerResponse.message?.includes('already exists')) {
          // User already exists, proceed to login
          console.log('User already exists, proceeding to login');
        } else {
          const errorMessage = registerResponse.error ?? registerResponse.message ?? 'Registration failed';
          alert(errorMessage);
          return;
        }
      }

      // Step 3: Sign in
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        alert('Login failed: ' + signInResult.error);
        return;
      }

      // Success
      setApplicationSubmitted(true);
      alert('Host application submitted successfully! An admin will review your application and get back to you within 24-48 hours.');

    } catch (error) {
      console.error('Failed to submit application:', error);
      alert('Failed to submit application: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section - Desktop Only */}
      <div className="hidden lg:block bg-gradient-to-br from-brand/5 via-brand/10 to-brand/5 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-24 h-24 bg-brand rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Home className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 text-gray-900">Become a GoWaay Host</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Join thousands of hosts earning extra income by sharing their spaces. 
              Start your hosting journey today and unlock new opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden p-4 text-center">
        <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Home className="h-10 w-10 text-brand" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Join as a Host</h1>
        <p className="text-gray-600">Start earning by hosting your space</p>
      </div>

      {/* Main Content - Two Column Layout for Desktop */}
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Column - Benefits (Sticky on Desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Benefits Card */}
            <div className="lg:sticky lg:top-24">
              <Card className="shadow-lg border-2 border-gray-100">
                <CardHeader className="bg-gradient-to-r from-brand to-brand/80 text-white">
                  <CardTitle className="text-2xl flex items-center">
                    <Home className="h-6 w-6 mr-3" />
                    Why Host with GoWaay?
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg transition-all hover:bg-green-100">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-md">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-900">Earn Extra Income</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Turn your unused space into a consistent source of income. Set your own prices and availability.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg transition-all hover:bg-blue-100">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-md">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-900">Flexible Hosting</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Host on your own schedule. You decide when and how you want to welcome guests.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg transition-all hover:bg-purple-100">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-md">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-900">24/7 Support</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Our dedicated support team is here around the clock to help you succeed as a host.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-lg transition-all hover:bg-orange-100">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-md">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-900">Secure Payments</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Get paid securely and on time with our trusted payment system. No hassle, guaranteed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Application Form */}
          <div className="lg:col-span-3">
            <Card className="shadow-xl border-2 border-gray-100">
              <CardHeader className="bg-gray-50 border-b-2 border-gray-100">
                <CardTitle className="text-2xl text-gray-900">Host Application Form</CardTitle>
                <p className="text-sm text-gray-600 mt-2">Fill out the form below to start your hosting journey</p>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 pb-3 border-b-2 border-brand/20">
                      <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-brand" />
                      </div>
                      <h3 className="font-bold text-xl text-gray-900">Personal Information</h3>
                    </div>
                    
                    <div className="grid lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                          <User className="inline h-4 w-4 mr-1 text-brand" />
                          Full Name *
                        </label>
                        <Input
                          {...register('name')}
                          placeholder="Enter your full name"
                          className={`h-12 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-brand'}`}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                          <Mail className="inline h-4 w-4 mr-1 text-brand" />
                          Email Address *
                        </label>
                        <Input
                          {...register('email')}
                          type="email"
                          placeholder="your.email@example.com"
                          className={`h-12 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-brand'}`}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        <Lock className="inline h-4 w-4 mr-1 text-brand" />
                        Password *
                      </label>
                      <Input
                        {...register('password')}
                        type="password"
                        placeholder="Minimum 6 characters"
                        className={`h-12 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-brand'}`}
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <span className="mr-1">⚠️</span>
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                          <Phone className="inline h-4 w-4 mr-1 text-brand" />
                          Phone Number *
                        </label>
                        <Input
                          {...register('phone')}
                          placeholder="+880 1234 567890"
                          className={`h-12 ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'focus:ring-brand'}`}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.phone.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                          <Phone className="inline h-4 w-4 mr-1 text-brand" />
                          WhatsApp Number *
                        </label>
                        <Input
                          {...register('whatsapp')}
                          placeholder="+880 1234 567890"
                          className={`h-12 ${errors.whatsapp ? 'border-red-500 focus:ring-red-500' : 'focus:ring-brand'}`}
                        />
                        {errors.whatsapp && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <span className="mr-1">⚠️</span>
                            {errors.whatsapp.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 pb-3 border-b-2 border-brand/20">
                      <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-brand" />
                      </div>
                      <h3 className="font-bold text-xl text-gray-900">Location Information</h3>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        <MapPin className="inline h-4 w-4 mr-1 text-brand" />
                        Property Location *
                      </label>
                      <Input
                        {...register('location')}
                        placeholder="House 123, Road 45, Gulshan, Dhaka"
                        className={`h-12 ${errors.location ? 'border-red-500 focus:ring-red-500' : 'focus:ring-brand'}`}
                      />
                      {errors.location && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <span className="mr-1">⚠️</span>
                          {errors.location.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">
                        <MapPin className="inline h-4 w-4 mr-1 text-brand" />
                        Google Maps Link *
                      </label>
                      <Input
                        {...register('mapLink')}
                        placeholder="https://maps.google.com/..."
                        className={`h-12 ${errors.mapLink ? 'border-red-500 focus:ring-red-500' : 'focus:ring-brand'}`}
                      />
                      <p className="text-xs text-gray-500 mt-1">Share your property location from Google Maps</p>
                      {errors.mapLink && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <span className="mr-1">⚠️</span>
                          {errors.mapLink.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 pb-3 border-b-2 border-brand/20">
                      <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-brand" />
                      </div>
                      <h3 className="font-bold text-xl text-gray-900">Identity Verification</h3>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">📋 Why we need this:</span> We verify all hosts to ensure the safety and security of our community.
                      </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          National ID (Front) *
                        </label>
                        <UploadField
                          onFileSelect={setNidFront}
                          accept="image/*"
                          maxSize={5 * 1024 * 1024}
                        />
                        <p className="text-xs text-gray-500">Max size: 5MB</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          National ID (Back) *
                        </label>
                        <UploadField
                          onFileSelect={setNidBack}
                          accept="image/*"
                          maxSize={5 * 1024 * 1024}
                        />
                        <p className="text-xs text-gray-500">Max size: 5MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t-2 border-gray-100">
                    <Button
                      type="submit"
                      className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                      disabled={submitting || applicationSubmitted}
                    >
                      {submitting 
                        ? '⏳ Submitting Application...' 
                        : applicationSubmitted 
                          ? '✓ Application Submitted Successfully' 
                          : '🚀 Submit Application'
                      }
                    </Button>
                    
                    {/* Terms */}
                    <div className="text-center text-xs text-gray-500 mt-4">
                      <p>
                        By submitting, you agree to our{' '}
                        <a href="/terms" className="text-brand hover:underline font-medium">
                          Terms of Service
                        </a>
                        ,{' '}
                        <a href="/privacy" className="text-brand hover:underline font-medium">
                          Privacy Policy
                        </a>
                        {' '}and{' '}
                        <a href="/refund" className="text-brand hover:underline font-medium">
                          Refund Policy
                        </a>
                      </p>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
