'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useHostBalance, useHostTransactions, useHostPayouts, type HostBalance, type HostTransaction, type HostPayoutRequest } from '@/lib/hooks/useHostData';

export default function HostBalance() {
  const { balance, loading: balanceLoading, error: balanceError } = useHostBalance();
  const { transactions, loading: transactionsLoading, error: transactionsError } = useHostTransactions();
  const { payouts, loading: payoutsLoading, error: payoutsError, requestPayout } = useHostPayouts();
  
  const [showRequestPayout, setShowRequestPayout] = useState(false);
  const [payoutRequest, setPayoutRequest] = useState({
    method: {
      type: 'bkash' as 'bkash' | 'nagad' | 'bank',
      accountNo: '',
      bankFields: {
        bankName: '',
        branchName: '',
        accountHolderName: '',
        routingNumber: ''
      }
    },
    amountTk: 0,
  });

  const loading = balanceLoading || transactionsLoading || payoutsLoading;
  const error = balanceError || transactionsError || payoutsError;

  const handleRequestPayout = async () => {
    if (!payoutRequest.method.type || !payoutRequest.amountTk) {
      return;
    }

    try {
      await requestPayout(payoutRequest);
      setPayoutRequest({
        method: {
          type: 'bkash',
          accountNo: '',
          bankFields: {
            bankName: '',
            branchName: '',
            accountHolderName: '',
            routingNumber: ''
          }
        },
        amountTk: 0,
      });
      setShowRequestPayout(false);
    } catch (error) {
      console.error('Failed to request payout:', error);
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

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <CreditCard className="h-4 w-4" />;
      case 'bkash':
      case 'nagad':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Balance & Payouts</h1>
            <p className="text-gray-600">Manage your earnings and payment methods</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading balance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pb-20 md:pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Balance & Payouts</h1>
            <p className="text-gray-600">Manage your earnings and payment methods</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error loading balance data: {error}</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Balance & Payouts</h1>
          <p className="text-gray-600">Manage your earnings and payment methods</p>
        </div>
      </div>

      {/* Earnings Summary - Hidden on mobile */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ৳{balance?.availableBalance?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Ready for payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ৳{balance?.totalEarnings?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ৳{balance?.pendingAmount?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ৳{balance?.monthlyEarnings?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Current month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payout Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Payout Requests</CardTitle>
              <Dialog open={showRequestPayout} onOpenChange={setShowRequestPayout}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={(balance?.availableBalance || 0) <= 0}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Request Payout
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Payout</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Available Balance</Label>
                      <p className="text-2xl font-bold text-green-600">
                        ৳{balance?.availableBalance?.toLocaleString() || 0}
                      </p>
                    </div>
                    
                    <div>
                      <Label>Payment Method Type</Label>
                      <Select value={payoutRequest.method.type} onValueChange={(value: any) => setPayoutRequest(prev => ({ ...prev, method: { ...prev.method, type: value } }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bkash">bKash</SelectItem>
                          <SelectItem value="nagad">Nagad</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(payoutRequest.method.type === 'bkash' || payoutRequest.method.type === 'nagad') && (
                      <div>
                        <Label>Account Number</Label>
                        <Input
                          value={payoutRequest.method.accountNo}
                          onChange={(e) => setPayoutRequest(prev => ({ ...prev, method: { ...prev.method, accountNo: e.target.value } }))}
                          placeholder="Enter account number"
                        />
                      </div>
                    )}

                    {payoutRequest.method.type === 'bank' && (
                      <>
                        <div>
                          <Label>Bank Name</Label>
                          <Input
                            value={payoutRequest.method.bankFields.bankName}
                            onChange={(e) => setPayoutRequest(prev => ({ ...prev, method: { ...prev.method, bankFields: { ...prev.method.bankFields, bankName: e.target.value } } }))}
                            placeholder="Enter bank name"
                          />
                        </div>
                        <div>
                          <Label>Branch Name</Label>
                          <Input
                            value={payoutRequest.method.bankFields.branchName}
                            onChange={(e) => setPayoutRequest(prev => ({ ...prev, method: { ...prev.method, bankFields: { ...prev.method.bankFields, branchName: e.target.value } } }))}
                            placeholder="Enter branch name"
                          />
                        </div>
                        <div>
                          <Label>Account Holder Name</Label>
                          <Input
                            value={payoutRequest.method.bankFields.accountHolderName}
                            onChange={(e) => setPayoutRequest(prev => ({ ...prev, method: { ...prev.method, bankFields: { ...prev.method.bankFields, accountHolderName: e.target.value } } }))}
                            placeholder="Enter account holder name"
                          />
                        </div>
                        <div>
                          <Label>Account Number</Label>
                          <Input
                            value={payoutRequest.method.accountNo}
                            onChange={(e) => setPayoutRequest(prev => ({ ...prev, method: { ...prev.method, accountNo: e.target.value } }))}
                            placeholder="Enter account number"
                          />
                        </div>
                      </>
                    )}
                    
                    <div>
                      <Label>Amount (Tk)</Label>
                      <Input
                        type="number"
                        value={payoutRequest.amountTk || ''}
                        onChange={(e) => setPayoutRequest(prev => ({ ...prev, amountTk: parseFloat(e.target.value) || 0 }))}
                        placeholder="Enter amount"
                        max={balance?.availableBalance || 0}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum: ৳{balance?.availableBalance?.toLocaleString() || 0}
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowRequestPayout(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleRequestPayout} disabled={!payoutRequest.method.type || !payoutRequest.amountTk}>
                        Request Payout
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payouts.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">Request #{request._id.slice(-8)}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      {request.method.type === 'bank' 
                        ? `${request.method.bankFields?.bankName} - ${request.method.accountNo}`
                        : `${request.method.type.toUpperCase()} - ${request.method.accountNo}`
                      }
                    </p>
                    <p className="text-lg font-semibold">৳{request.amountTk.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      Requested: {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                    </p>
                    {request.status === 'approved' && (
                      <p className="text-xs text-gray-500">
                        Processed: {format(new Date(request.updatedAt), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {payouts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No payout requests</p>
                  <p className="text-sm">Request a payout when you have available balance</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  {transaction.type === 'booking' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <DollarSign className="h-5 w-5 text-blue-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}৳{Math.abs(transaction.amount).toLocaleString()}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
            
            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No transactions yet</p>
                <p className="text-sm">Your transaction history will appear here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
