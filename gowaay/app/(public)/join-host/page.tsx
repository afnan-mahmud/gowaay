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
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Join as a Host</h1>
          <p className="text-gray-600">Start earning by hosting your space</p>
        </div>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Why Host with GoWaay?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                ✓
              </div>
              <div>
                <p className="font-medium">Earn extra income</p>
                <p className="text-sm text-gray-600">Turn your space into a source of income</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                ✓
              </div>
              <div>
                <p className="font-medium">Flexible hosting</p>
                <p className="text-sm text-gray-600">Host when you want, how you want</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                ✓
              </div>
              <div>
                <p className="font-medium">24/7 support</p>
                <p className="text-sm text-gray-600">We're here to help you succeed</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                ✓
              </div>
              <div>
                <p className="font-medium">Secure payments</p>
                <p className="text-sm text-gray-600">Get paid securely and on time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Host Application Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <Input
                    {...register('name')}
                    placeholder="Enter your full name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="Enter your email address"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password *</label>
                  <Input
                    {...register('password')}
                    type="password"
                    placeholder="Enter your password (min 6 characters)"
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <Input
                    {...register('phone')}
                    placeholder="+880 1234 567890"
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">WhatsApp Number *</label>
                  <Input
                    {...register('whatsapp')}
                    placeholder="+880 1234 567890"
                    className={errors.whatsapp ? 'border-red-500' : ''}
                  />
                  {errors.whatsapp && (
                    <p className="text-red-500 text-sm mt-1">{errors.whatsapp.message}</p>
                  )}
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Property Location *</label>
                  <Input
                    {...register('location')}
                    placeholder="Enter your property address"
                    className={errors.location ? 'border-red-500' : ''}
                  />
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Google Maps Link *</label>
                  <Input
                    {...register('mapLink')}
                    placeholder="https://maps.google.com/..."
                    className={errors.mapLink ? 'border-red-500' : ''}
                  />
                  {errors.mapLink && (
                    <p className="text-red-500 text-sm mt-1">{errors.mapLink.message}</p>
                  )}
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Required Documents
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">NID Front *</label>
                    <UploadField
                      onFileSelect={setNidFront}
                      accept="image/*"
                      maxSize={5 * 1024 * 1024} // 5MB
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">NID Back *</label>
                    <UploadField
                      onFileSelect={setNidBack}
                      accept="image/*"
                      maxSize={5 * 1024 * 1024} // 5MB
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting || applicationSubmitted}
              >
                {submitting 
                  ? 'Submitting Application...' 
                  : applicationSubmitted 
                    ? 'Application Submitted' 
                    : 'Submit Application'
                }
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Terms */}
        <div className="text-center text-sm text-gray-600">
          <p>
            By submitting this application, you agree to our{' '}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/refund" className="text-primary hover:underline">
              Refund Policy
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
