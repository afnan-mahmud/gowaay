'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Plus,
  X,
  Upload,
  MapPin,
  Image as ImageIcon,
  Loader2,
  Trash2
} from 'lucide-react';
import { api } from '@/lib/api';

interface RoomFormData {
  title: string;
  description: string;
  address: string;
  locationName: string;
  locationMapUrl?: string;
  roomType: 'single' | 'double' | 'family' | 'suite' | 'other';
  amenities: string[];
  basePriceTk: number;
  commissionTk: number;
  maxGuests?: number;
  bedrooms?: number;
  beds?: number;
  baths?: number;
  images: Array<{
    url: string;
    w: number;
    h: number;
  }>;
  instantBooking: boolean;
  unavailableDates: string[];
}

interface UploadedImage {
  url: string;
  w: number;
  h: number;
  file?: File;
  isExisting?: boolean;
}

const AMENITIES_OPTIONS = [
  'WiFi', 'Air Conditioning', 'Heating', 'Kitchen', 'Parking', 'Pool', 'Gym',
  'Laundry', 'TV', 'Refrigerator', 'Microwave', 'Balcony', 'Garden', 'Security',
  'Elevator', 'Pet Friendly', 'Smoking Allowed', 'Wheelchair Accessible'
];

const ROOM_TYPES = [
  { value: 'single', label: 'Single Room' },
  { value: 'double', label: 'Double Room' },
  { value: 'family', label: 'Family Room' },
  { value: 'suite', label: 'Suite' },
  { value: 'other', label: 'Other' }
];

export default function AdminEditRoom() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAmenity, setNewAmenity] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const isSubmittingRef = useRef(false);
  
  const [formData, setFormData] = useState<RoomFormData>({
    title: '',
    description: '',
    address: '',
    locationName: '',
    roomType: 'single',
    amenities: [],
    basePriceTk: 0,
    commissionTk: 0,
    images: [],
    instantBooking: false,
    unavailableDates: []
  });

  // Fetch existing room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoadingRoom(true);
        const response = await api.rooms.get(roomId);
        
        if (response.success && response.data) {
          const room = response.data as any;
          setFormData({
            title: room.title || '',
            description: room.description || '',
            address: room.address || '',
            locationName: room.locationName || '',
            locationMapUrl: room.locationMapUrl || '',
            roomType: room.roomType || 'single',
            amenities: room.amenities || [],
            basePriceTk: room.basePriceTk || 0,
            commissionTk: room.commissionTk || 0,
            maxGuests: room.maxGuests,
            bedrooms: room.bedrooms,
            beds: room.beds,
            baths: room.baths,
            images: room.images || [],
            instantBooking: room.instantBooking || false,
            unavailableDates: room.unavailableDates || []
          });
          
          // Set existing images
          const existingImages = (room.images || []).map((img: any) => ({
            url: img.url,
            w: img.w || 800,
            h: img.h || 600,
            isExisting: true
          }));
          setUploadedImages(existingImages);
        } else {
          setError('Failed to load room data');
        }
      } catch (err) {
        console.error('Error fetching room:', err);
        setError('Failed to load room data');
      } finally {
        setLoadingRoom(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  const handleInputChange = (field: keyof RoomFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      handleInputChange('amenities', [...formData.amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    handleInputChange('amenities', formData.amenities.filter(a => a !== amenity));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remainingSlots = 15 - uploadedImages.length;
    const filesToUpload = fileArray.slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      setError('Maximum 15 images allowed');
      return;
    }

    setUploadingImages(true);
    setError(null);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const response = await api.uploads.image(file);
        if (response.success && response.data) {
          return {
            url: (response.data as any).url,
            w: 800,
            h: 600,
            file: file,
            isExisting: false
          };
        }
        throw new Error('Upload failed');
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...uploadedFiles]);

      const newImages = uploadedFiles.map(img => ({ url: img.url, w: img.w, h: img.h }));
      handleInputChange('images', [...formData.images, ...newImages]);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveUploadedImage = (index: number) => {
    const imageToRemove = uploadedImages[index];
    setUploadedImages(prev => prev.filter((_, i) => i !== index));

    const newImages = formData.images.filter(img => img.url !== imageToRemove.url);
    handleInputChange('images', newImages);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading || isSubmittingRef.current) {
      return;
    }

    if (!formData.title || !formData.description || !formData.address || !formData.locationName) {
      setError('Please fill in all required fields');
      return;
    }

    if (uploadedImages.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    if (formData.basePriceTk <= 0) {
      setError('Please enter a valid base price');
      return;
    }

    try {
      isSubmittingRef.current = true;
      setLoading(true);
      setError(null);

      const response = await api.admin.updateRoom(roomId, formData);

      if (response.success) {
        router.push('/admin/rooms');
      } else {
        setError(response.message || 'Failed to update room');
        setLoading(false);
        isSubmittingRef.current = false;
      }
    } catch (error) {
      console.error('Failed to update room:', error);
      setError('Failed to update room');
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  if (loadingRoom) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Room</h1>
          <p className="text-gray-600">Update room listing details</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter property title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the property in detail"
                rows={4}
                required
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter full address"
                  required
                />
              </div>

              <div>
                <Label htmlFor="locationName">Location Name *</Label>
                <Input
                  id="locationName"
                  value={formData.locationName}
                  onChange={(e) => handleInputChange('locationName', e.target.value)}
                  placeholder="e.g., Dhaka, Chittagong"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="locationMapUrl">Google Maps URL</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="locationMapUrl"
                  value={formData.locationMapUrl || ''}
                  onChange={(e) => handleInputChange('locationMapUrl', e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="roomType">Room Type *</Label>
              <Select
                value={formData.roomType}
                onValueChange={(value: string) => handleInputChange('roomType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="maxGuests">Max Guests</Label>
                <Input
                  id="maxGuests"
                  type="number"
                  value={formData.maxGuests || ''}
                  onChange={(e) => handleInputChange('maxGuests', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms || ''}
                  onChange={(e) => handleInputChange('bedrooms', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="beds">Beds</Label>
                <Input
                  id="beds"
                  type="number"
                  value={formData.beds || ''}
                  onChange={(e) => handleInputChange('beds', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="baths">Bathrooms</Label>
                <Input
                  id="baths"
                  type="number"
                  value={formData.baths || ''}
                  onChange={(e) => handleInputChange('baths', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePriceTk">Base Price (Tk) *</Label>
                <Input
                  id="basePriceTk"
                  type="number"
                  value={formData.basePriceTk}
                  onChange={(e) => handleInputChange('basePriceTk', Number(e.target.value))}
                  placeholder="Enter base price per night"
                  min="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="commissionTk">Commission (Tk)</Label>
                <Input
                  id="commissionTk"
                  type="number"
                  value={formData.commissionTk}
                  onChange={(e) => handleInputChange('commissionTk', Number(e.target.value))}
                  placeholder="Commission amount"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-calculated for new rooms. You can manually adjust if needed.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="instantBooking"
                checked={formData.instantBooking}
                onCheckedChange={(checked: boolean) => handleInputChange('instantBooking', checked)}
              />
              <Label htmlFor="instantBooking">Enable Instant Booking</Label>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{amenity}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(amenity)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex space-x-2">
              <Select value={newAmenity} onValueChange={setNewAmenity}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select an amenity" />
                </SelectTrigger>
                <SelectContent>
                  {AMENITIES_OPTIONS.filter(option => !formData.amenities.includes(option)).map((amenity) => (
                    <SelectItem key={amenity} value={amenity}>
                      {amenity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddAmenity} disabled={!newAmenity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <p className="text-sm text-gray-600">
              Upload up to 15 images. Drag and drop or click to select files.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
                disabled={uploadingImages || uploadedImages.length >= 15}
              />

              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {uploadingImages ? (
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    ) : (
                      <Upload className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {uploadingImages ? 'Uploading...' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG up to 5MB each
                    </p>
                    <p className="text-xs text-gray-500">
                      {uploadedImages.length}/15 images uploaded
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingImages || uploadedImages.length >= 15}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Choose Images
                  </Button>
                </div>
              </label>
            </div>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {image.isExisting && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-xs">Existing</Badge>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveUploadedImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || uploadingImages}
            className="bg-brand hover:bg-brand/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : 'Update Room'}
          </Button>
        </div>
      </form>
    </div>
  );
}

