'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Eye, 
  Check, 
  X, 
  Trash2, 
  MapPin, 
  DollarSign,
  User,
  Calendar
} from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface Room {
  _id: string;
  title: string;
  description: string;
  address: string;
  locationName: string;
  roomType: 'single' | 'double' | 'family' | 'suite' | 'other';
  basePriceTk: number;
  commissionTk: number;
  totalPriceTk: number;
  images: Array<{
    url: string;
    w: number;
    h: number;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  hostId: {
    _id: string;
    displayName: string;
    locationName: string;
  };
  createdAt: string;
  amenities: string[];
}

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [commissionTk, setCommissionTk] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.admin.rooms();
      
      if (response.success && response.data) {
        setRooms(response.data as Room[]);
        setFilteredRooms(response.data as Room[]);
      } else {
        setError(response.message || 'Failed to fetch rooms');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    let filtered = rooms;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.hostId.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (activeTab !== 'all') {
      filtered = filtered.filter(room => room.status === activeTab);
    }

    setFilteredRooms(filtered);
  }, [rooms, searchTerm, activeTab]);

  const handleApprove = async (roomId: string, customCommission?: number) => {
    try {
      setActionLoading(roomId);
      
      // Use custom commission if provided, otherwise use the state value
      const commissionToUse = customCommission !== undefined ? customCommission : (commissionTk || 0);
      
      const response = await api.admin.approveRoom(roomId, {
        status: 'approved',
        commissionTk: commissionToUse
      });
      
      if (response.success) {
        await fetchRooms(); // Refresh the list
        setSelectedRoom(null);
        setCommissionTk(0);
      } else {
        alert(response.message || 'Failed to approve room');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (roomId: string) => {
    try {
      setActionLoading(roomId);
      
      const response = await api.admin.rejectRoom(roomId, {
        status: 'rejected'
      });
      
      if (response.success) {
        await fetchRooms(); // Refresh the list
        setSelectedRoom(null);
      } else {
        alert(response.message || 'Failed to reject room');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'single': return 'Single Room';
      case 'double': return 'Double Room';
      case 'family': return 'Family Suite';
      case 'suite': return 'Suite';
      case 'other': return 'Other';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Room Management</h1>
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-24 w-32 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Room Management</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error loading rooms: {error}</p>
          <Button onClick={fetchRooms}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Room Management</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({rooms.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({rooms.filter(r => r.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({rooms.filter(r => r.status === 'approved').length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rooms.filter(r => r.status === 'rejected').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredRooms.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No rooms found</p>
              </CardContent>
            </Card>
          ) : (
            filteredRooms.map((room) => (
              <Card key={room._id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="relative h-24 w-32 rounded-lg overflow-hidden">
                      <Image
                        src={room.images[0]?.url || '/images/placeholder-room.jpg'}
                        alt={room.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{room.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {room.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(room.status)}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{room.locationName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{room.hostId.displayName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium">৳{room.totalPriceTk.toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground">
                            (Base: ৳{room.basePriceTk.toLocaleString()}, Commission: ৳{room.commissionTk.toLocaleString()})
                          </span>
                        </div>
                        <Badge variant="outline">{getRoomTypeLabel(room.roomType)}</Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Room Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Title</Label>
                                  <p className="text-sm">{room.title}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Type</Label>
                                  <p className="text-sm">{getRoomTypeLabel(room.roomType)}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Location</Label>
                                  <p className="text-sm">{room.locationName}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Host</Label>
                                  <p className="text-sm">{room.hostId.displayName}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Base Price</Label>
                                  <p className="text-sm">৳{room.basePriceTk.toLocaleString()}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Commission</Label>
                                  <p className="text-sm">৳{room.commissionTk.toLocaleString()}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Total Price</Label>
                                  <p className="text-sm font-medium">৳{room.totalPriceTk.toLocaleString()}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Status</Label>
                                  <div>{getStatusBadge(room.status)}</div>
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Description</Label>
                                <p className="text-sm mt-1">{room.description}</p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Address</Label>
                                <p className="text-sm mt-1">{room.address}</p>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Amenities</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {room.amenities.map((amenity, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {amenity}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              {room.status === 'pending' && (
                                <div className="border-t pt-4">
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="commission" className="text-sm font-medium">
                                        Commission Amount (৳)
                                      </Label>
                                      <Input
                                        id="commission"
                                        type="number"
                                        value={commissionTk}
                                        onChange={(e) => setCommissionTk(Number(e.target.value))}
                                        placeholder="Enter commission amount"
                                        className="mt-1"
                                      />
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        onClick={() => handleApprove(room._id)}
                                        disabled={actionLoading === room._id}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        {actionLoading === room._id ? (
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        ) : (
                                          <Check className="h-4 w-4 mr-1" />
                                        )}
                                        Approve
                                      </Button>
                                      <Button
                                        onClick={() => handleReject(room._id)}
                                        disabled={actionLoading === room._id}
                                        variant="destructive"
                                      >
                                        {actionLoading === room._id ? (
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        ) : (
                                          <X className="h-4 w-4 mr-1" />
                                        )}
                                        Reject
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {room.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleApprove(room._id, room.commissionTk)}
                              disabled={actionLoading === room._id}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              {actionLoading === room._id ? 'Approving...' : 'Quick Approve'}
                            </Button>
                            <Button
                              onClick={() => handleReject(room._id)}
                              disabled={actionLoading === room._id}
                              size="sm"
                              variant="destructive"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}