'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Home,
  MapPin,
  DollarSign,
  Calendar,
  Settings,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useHostRooms, HostRoom } from '@/lib/hooks/useHostData';
import { api } from '@/lib/api';

interface Listing extends HostRoom {
  // Extending the HostRoom interface from the hook
}

export default function HostListings() {
  const { rooms: listings, loading, error } = useHostRooms();
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  useEffect(() => {
    filterListings();
  }, [listings, searchTerm]);

  const filterListings = () => {
    let filtered = listings || [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.roomType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  };

  const handleToggleInstantBooking = async (listingId: string, enabled: boolean) => {
    try {
      const response = await api.hosts.updateRoom(listingId, { instantBooking: enabled });
      if (response.success) {
        // Refresh the listings data
        window.location.reload();
      } else {
        console.error('Failed to toggle instant booking:', response.message);
      }
    } catch (error) {
      console.error('Failed to toggle instant booking:', error);
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      const response = await api.hosts.deleteRoom(listingId);
      if (response.success) {
        // Refresh the listings data
        window.location.reload();
      } else {
        console.error('Failed to delete listing:', response.message);
      }
    } catch (error) {
      console.error('Failed to delete listing:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600">Manage your property listings</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600">Manage your property listings</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error loading listings: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-600">Manage your property listings</p>
        </div>
        <Link href="/host/listings/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Listing
          </Button>
        </Link>
      </div>

      {/* Summary Cards - Hidden on mobile */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listings?.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">All properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {listings?.filter(l => l.status === 'approved').length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Approved listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {listings?.filter(l => l.status === 'pending').length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Instant Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {listings?.filter(l => l.instantBooking).length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Enabled</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle>Listings</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <div key={listing._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start space-y-3 md:space-y-0 md:space-x-4">
                  {/* Image - Full width on mobile, fixed size on desktop */}
                  <div className="w-full h-40 md:w-24 md:h-24 bg-gray-200 rounded-lg flex-shrink-0 md:flex-shrink-0">
                    {listing.images && listing.images[0] ? (
                      <Image
                        src={listing.images[0].url}
                        alt={listing.title}
                        width={400}
                        height={160}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content - Full width on mobile */}
                  <div className="flex-1 min-w-0 w-full md:w-auto">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between space-y-3 md:space-y-0">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(listing.status)}
                            {listing.instantBooking && (
                              <Badge variant="outline" className="text-blue-600 border-blue-600">
                                Instant Booking
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {listing.locationName}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ৳{listing.totalPriceTk.toLocaleString()}/night
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-left md:text-right">
                        <div className="text-lg font-semibold">৳{listing.totalPriceTk.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">
                          Base: ৳{listing.basePriceTk.toLocaleString()}
                          {listing.commissionTk > 0 && (
                            <span> + Commission: ৳{listing.commissionTk.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mt-4 space-y-3 lg:space-y-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Instant Booking:</span>
                        <Switch
                          checked={listing.instantBooking}
                          onCheckedChange={(enabled) => handleToggleInstantBooking(listing._id, enabled)}
                          disabled={listing.status !== 'approved'}
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/host/listings/${listing._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        
                        <Link href={`/host/listings/${listing._id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(listing._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredListings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No listings found matching your criteria.</p>
                <Link href="/host/listings/new">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Listing
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
