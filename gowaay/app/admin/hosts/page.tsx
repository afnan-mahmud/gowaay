'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Eye, 
  Check, 
  X, 
  User,
  Phone,
  Mail,
  MapPin,
  Home,
  Calendar,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api';

interface Host {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  displayName: string;
  phone: string;
  whatsapp: string;
  locationName: string;
  locationMapUrl: string;
  nidFrontUrl: string;
  nidBackUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  propertyCount: number;
  totalEarnings: number;
  createdAt: string;
  lastActive: string;
}

export default function AdminHosts() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [filteredHosts, setFilteredHosts] = useState<Host[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    // Add a small delay to ensure auth token is set
    const timer = setTimeout(() => {
      fetchHosts();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    filterHosts();
  }, [hosts, searchTerm, statusFilter]);

  const fetchHosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching hosts...');
      console.log('Auth token:', localStorage.getItem('auth_token'));
      
      const response = await api.admin.hosts({ 
        page: 1, 
        limit: 20, 
        status: statusFilter !== 'all' ? statusFilter : undefined 
      });
      
      console.log('Hosts response:', response);
      
      if (response.success && response.data) {
        // Map backend data to frontend Host interface
        const hostsData = (response.data as any).hosts.map((host: any) => ({
          id: host._id,
          userId: host.userId?._id || '',
          userName: host.userId?.name || '',
          userEmail: host.userId?.email || '',
          userPhone: host.userId?.phone || '',
          displayName: host.displayName || '',
          phone: host.phone || '',
          whatsapp: host.whatsapp || '',
          locationName: host.locationName || '',
          locationMapUrl: host.locationMapUrl || '',
          nidFrontUrl: host.nidFrontUrl || '',
          nidBackUrl: host.nidBackUrl || '',
          status: host.status || 'pending',
          propertyCount: host.propertyCount || 0,
          totalEarnings: host.totalEarnings || 0,
          createdAt: host.createdAt || '',
          lastActive: host.updatedAt || host.createdAt || '',
        }));
        
        setHosts(hostsData);
      } else {
        setError(response.message || 'Failed to fetch hosts');
      }
    } catch (error) {
      console.error('Failed to fetch hosts:', error);
      console.error('Error details:', error);
      setError('Failed to fetch hosts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterHosts = () => {
    let filtered = hosts;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(host => host.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(host =>
        host.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        host.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        host.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        host.locationName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredHosts(filtered);
  };

  const handleApprove = async (hostId: string) => {
    try {
      const response = await api.admin.approveHost(hostId, { status: 'approved' });
      
      if (response.success) {
        // Refetch the list to get updated data
        await fetchHosts();
        alert('Host approved successfully!');
      } else {
        alert('Failed to approve host: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to approve host:', error);
      alert('Failed to approve host. Please try again.');
    }
  };

  const handleReject = async (hostId: string) => {
    try {
      const response = await api.admin.rejectHost(hostId, { status: 'rejected' });
      
      if (response.success) {
        // Refetch the list to get updated data
        await fetchHosts();
        alert('Host rejected successfully!');
      } else {
        alert('Failed to reject host: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to reject host:', error);
      alert('Failed to reject host. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Host Management</h1>
          <p className="text-gray-600">Manage host applications and approvals</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hosts</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search hosts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading hosts...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchHosts}>Try Again</Button>
            </div>
          ) : filteredHosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hosts found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHosts.map((host) => (
              <div key={host.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {host.displayName}
                      </h3>
                      {getStatusBadge(host.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{host.userName}</h4>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Mail className="h-4 w-4 mr-1" />
                          {host.userEmail}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {host.phone}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {host.locationName}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Home className="h-4 w-4 mr-1" />
                          {host.propertyCount} {host.propertyCount === 1 ? 'property' : 'properties'}
                        </p>
                        {host.status === 'approved' && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ৳{host.totalEarnings.toLocaleString()} earned
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Joined: {format(new Date(host.createdAt), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Last active: {format(new Date(host.lastActive), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Host Details - {host.displayName}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Personal Information */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                              <div>
                                <p className="text-sm font-medium text-gray-600">Full Name</p>
                                <p>{host.userName}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Email</p>
                                <p>{host.userEmail}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Phone</p>
                                <p>{host.phone}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">WhatsApp</p>
                                <p>{host.whatsapp}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Business Information */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Business Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                              <div>
                                <p className="text-sm font-medium text-gray-600">Display Name</p>
                                <p>{host.displayName}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Location</p>
                                <p>{host.locationName}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Property Count</p>
                                <p>{host.propertyCount} {host.propertyCount === 1 ? 'property' : 'properties'}</p>
                              </div>
                              {host.status === 'approved' && (
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                                  <p className="font-semibold">৳{host.totalEarnings.toLocaleString()}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Documents */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Documents</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">NID Front</p>
                                <div className="bg-gray-100 p-4 rounded-lg text-center">
                                  {host.nidFrontUrl ? (
                                    <img 
                                      src={host.nidFrontUrl} 
                                      alt="NID Front" 
                                      className="max-w-full h-32 object-contain mx-auto rounded"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        (e.currentTarget.nextElementSibling as HTMLElement)?.style && ((e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block');
                                      }}
                                    />
                                  ) : null}
                                  <p className="text-sm text-gray-500" style={{ display: host.nidFrontUrl ? 'none' : 'block' }}>
                                    Document Preview
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">NID Back</p>
                                <div className="bg-gray-100 p-4 rounded-lg text-center">
                                  {host.nidBackUrl ? (
                                    <img 
                                      src={host.nidBackUrl} 
                                      alt="NID Back" 
                                      className="max-w-full h-32 object-contain mx-auto rounded"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        (e.currentTarget.nextElementSibling as HTMLElement)?.style && ((e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block');
                                      }}
                                    />
                                  ) : null}
                                  <p className="text-sm text-gray-500" style={{ display: host.nidBackUrl ? 'none' : 'block' }}>
                                    Document Preview
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Status and Actions */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Status & Actions</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Current Status</p>
                                  {getStatusBadge(host.status)}
                                </div>
                                {host.status === 'pending' && (
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleApprove(host.id)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleReject(host.id)}
                                    >
                                      <X className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {host.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(host.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(host.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
