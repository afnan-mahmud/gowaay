'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Eye, 
  Check, 
  X, 
  User,
  DollarSign,
  Calendar,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api';

interface PaymentRequest {
  _id: string;
  hostId: {
    _id: string;
    displayName: string;
    locationName?: string;
  };
  method: {
    type: 'bkash' | 'nagad' | 'bank';
    subtype?: 'personal' | 'merchant' | 'agent';
    accountNo?: string;
    bankFields?: {
      bankName?: string;
      branchName?: string;
      accountHolderName?: string;
      routingNumber?: string;
    };
  };
  amountTk: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function AdminPayments() {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PaymentRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [paymentRequests, searchTerm, statusFilter]);

  const fetchPaymentRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.admin.payouts.list({ page: 1, limit: 100 });
      
      if (response.success && response.data) {
        setPaymentRequests((response.data as any).payoutRequests || []);
      } else {
        setError(response.message || 'Failed to fetch payment requests');
      }
    } catch (error) {
      console.error('Failed to fetch payment requests:', error);
      setError('Failed to fetch payment requests');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = paymentRequests;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.hostId.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.hostId.locationName && request.hostId.locationName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredRequests(filtered);
  };

  const handleApprove = async (requestId: string) => {
    try {
      const response = await api.admin.payouts.approve(requestId);
      
      if (response.success) {
        // Refresh the payment requests after approval
        await fetchPaymentRequests();
      } else {
        setError(response.message || 'Failed to approve payment request');
      }
    } catch (error) {
      console.error('Failed to approve payment request:', error);
      setError('Failed to approve payment request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const response = await api.admin.payouts.reject(requestId);
      
      if (response.success) {
        // Refresh the payment requests after rejection
        await fetchPaymentRequests();
      } else {
        setError(response.message || 'Failed to reject payment request');
      }
    } catch (error) {
      console.error('Failed to reject payment request:', error);
      setError('Failed to reject payment request');
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

  const getMethodBadge = (method: { type: string; subtype?: string }) => {
    const variants = {
      bank: 'bg-blue-100 text-blue-800',
      bkash: 'bg-green-100 text-green-800',
      nagad: 'bg-orange-100 text-orange-800',
    };
    return (
      <Badge className={variants[method.type as keyof typeof variants]}>
        {method.type.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Requests</h1>
          <p className="text-gray-600">Manage host payout requests</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600">
              <p className="font-medium">Error loading payment requests</p>
              <p className="text-sm">{error}</p>
            </div>
            <div className="ml-auto">
              <Button onClick={fetchPaymentRequests} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentRequests.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">All time requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {paymentRequests.filter(r => r.status === 'pending').length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ৳{paymentRequests.reduce((sum, r) => sum + (r.amountTk || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">All requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ৳{paymentRequests
                .filter(r => r.status === 'pending')
                .reduce((sum, r) => sum + (r.amountTk || 0), 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment Requests</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search requests..."
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
            <div className="text-center py-8">
              <p className="text-gray-600">Loading payment requests...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
              <div key={request._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Request #{request._id.slice(-8)}
                      </h3>
                      {getStatusBadge(request.status)}
                      {getMethodBadge(request.method)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{request.hostId.displayName}</h4>
                        {request.hostId.locationName && (
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <User className="h-4 w-4 mr-1" />
                            {request.hostId.locationName}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-lg font-semibold text-gray-900 flex items-center">
                          <DollarSign className="h-5 w-5 mr-1" />
                          ৳{(request.amountTk || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-600 mb-1">Account Details:</p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        {request.method.type === 'bank' && request.method.bankFields && (
                          <div className="space-y-1">
                            <p className="text-sm"><span className="font-medium">Bank:</span> {request.method.bankFields.bankName}</p>
                            <p className="text-sm"><span className="font-medium">Account:</span> {request.method.accountNo}</p>
                            {request.method.bankFields.accountHolderName && (
                              <p className="text-sm"><span className="font-medium">Holder:</span> {request.method.bankFields.accountHolderName}</p>
                            )}
                          </div>
                        )}
                        {(request.method.type === 'bkash' || request.method.type === 'nagad') && (
                          <div className="space-y-1">
                            <p className="text-sm"><span className="font-medium">Provider:</span> {request.method.type.toUpperCase()}</p>
                            <p className="text-sm"><span className="font-medium">Number:</span> {request.method.accountNo}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {request.status !== 'pending' && (
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Processed:</span> {format(new Date(request.updatedAt), 'MMM dd, yyyy HH:mm')}
                      </div>
                    )}
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
                          <DialogTitle>Payment Request Details - #{request._id.slice(-8)}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Host Information */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Host Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="font-medium">{request.hostId.displayName}</p>
                              {request.hostId.locationName && (
                                <p className="text-sm text-gray-600">{request.hostId.locationName}</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Payment Details */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Payment Details</h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                              <div className="flex justify-between">
                                <span className="font-medium">Amount:</span>
                                <span className="font-semibold">৳{(request.amountTk || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Method:</span>
                                <span>{getMethodBadge(request.method)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Status:</span>
                                <span>{getStatusBadge(request.status)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Account Details */}
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Account Details</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              {request.method.type === 'bank' && request.method.bankFields && (
                                <div className="space-y-2">
                                  <div>
                                    <span className="font-medium">Bank Name:</span>
                                    <p className="text-sm">{request.method.bankFields.bankName}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Account Number:</span>
                                    <p className="text-sm font-mono">{request.method.accountNo}</p>
                                  </div>
                                  {request.method.bankFields.accountHolderName && (
                                    <div>
                                      <span className="font-medium">Account Holder:</span>
                                      <p className="text-sm">{request.method.bankFields.accountHolderName}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                              {(request.method.type === 'bkash' || request.method.type === 'nagad') && (
                                <div className="space-y-2">
                                  <div>
                                    <span className="font-medium">Provider:</span>
                                    <p className="text-sm">{request.method.type.toUpperCase()}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Account Number:</span>
                                    <p className="text-sm font-mono">{request.method.accountNo}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    {request.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request._id)}
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
            
              {filteredRequests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No payment requests found matching your criteria.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
