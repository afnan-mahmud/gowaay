'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api';

interface AccountSummary {
  totalCommission: number;
  totalPayouts: number;
  totalSpend: number;
  totalAdjustments: number;
  netIncome: number;
  transactionCount: number;
}

interface LedgerEntry {
  _id: string;
  type: 'commission' | 'payout' | 'spend' | 'adjustment';
  ref?: {
    bookingId?: {
      _id: string;
      transactionId: string;
      amountTk: number;
    };
    payoutRequestId?: {
      _id: string;
      amountTk: number;
      method: any;
    };
  };
  amountTk: number;
  note: string;
  at: string;
}

export default function AdminAccounts() {
  const [summary, setSummary] = useState<AccountSummary>({
    totalCommission: 0,
    totalPayouts: 0,
    totalSpend: 0,
    totalAdjustments: 0,
    netIncome: 0,
    transactionCount: 0,
  });
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [filteredLedger, setFilteredLedger] = useState<LedgerEntry[]>([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddSpend, setShowAddSpend] = useState(false);
  const [newSpend, setNewSpend] = useState({
    amount: '',
    note: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterLedger();
  }, [ledger, typeFilter, dateFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch account summary
      const summaryResponse = await api.admin.accounts.summary();
      if (summaryResponse.success && summaryResponse.data) {
        setSummary(summaryResponse.data as AccountSummary);
      } else {
        setError(summaryResponse.message || 'Failed to fetch account summary');
      }
      
      // Fetch ledger entries
      const ledgerResponse = await api.admin.accounts.ledger();
      if (ledgerResponse.success && ledgerResponse.data) {
        setLedger(ledgerResponse.data as LedgerEntry[]);
      } else {
        setError(ledgerResponse.message || 'Failed to fetch ledger entries');
      }
    } catch (error) {
      console.error('Failed to fetch account data:', error);
      setError('Failed to fetch account data');
    } finally {
      setLoading(false);
    }
  };

  const filterLedger = () => {
    let filtered = ledger;

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(entry => entry.type === typeFilter);
    }

    // Filter by date (last 30 days, last 7 days, etc.)
    if (dateFilter !== 'all') {
      const now = new Date();
      let cutoffDate: Date;
      
      switch (dateFilter) {
        case '7days':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }
      
      filtered = filtered.filter(entry => new Date(entry.at) >= cutoffDate);
    }

    setFilteredLedger(filtered);
  };

  const handleAddSpend = async () => {
    try {
      const response = await api.admin.accounts.addSpend({
        amountTk: parseFloat(newSpend.amount),
        note: newSpend.note,
      });

      if (response.success) {
        // Refresh data after adding spend
        await fetchData();
        setNewSpend({ amount: '', note: '' });
        setShowAddSpend(false);
      } else {
        setError(response.message || 'Failed to add spend entry');
      }
    } catch (error) {
      console.error('Failed to add spend entry:', error);
      setError('Failed to add spend entry');
    }
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      commission: 'bg-green-100 text-green-800',
      spend: 'bg-red-100 text-red-800',
      adjustment: 'bg-blue-100 text-blue-800',
      payout: 'bg-purple-100 text-purple-800',
    };
    return (
      <Badge className={variants[type as keyof typeof variants]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const formatAmount = (amount: number) => {
    const isPositive = amount > 0;
    return (
      <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
        {isPositive ? '+' : ''}৳{Math.abs(amount).toLocaleString()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
          <p className="text-gray-600">Monitor income, expenses, and financial overview</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={showAddSpend} onOpenChange={setShowAddSpend}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Expense Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (Tk)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newSpend.amount}
                    onChange={(e) => setNewSpend(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label htmlFor="note">Description</Label>
                  <Input
                    id="note"
                    value={newSpend.note}
                    onChange={(e) => setNewSpend(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="Enter description"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddSpend(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSpend} disabled={!newSpend.amount || !newSpend.note}>
                    Add Expense
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600">
              <p className="font-medium">Error loading account data</p>
              <p className="text-sm">{error}</p>
            </div>
            <div className="ml-auto">
              <Button onClick={fetchData} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Loading...</CardTitle>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ৳{(summary.totalCommission || 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              From bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Payouts</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ৳{(summary.totalPayouts || 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              To hosts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Spend</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ৳{(summary.totalSpend || 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ৳{(summary.netIncome || 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {summary.transactionCount || 0} transactions
            </p>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Ledger Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Account Ledger</CardTitle>
            <div className="flex items-center space-x-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="commission">Commission</SelectItem>
                  <SelectItem value="spend">Spend</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="payout">Payout</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading ledger entries...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Reference</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedger.map((entry) => (
                  <tr key={entry._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-600">
                      {format(new Date(entry.at), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="py-3">
                      {getTypeBadge(entry.type)}
                    </td>
                    <td className="py-3 text-sm font-mono text-gray-600">
                      {entry.ref?.bookingId?.transactionId || 
                       entry.ref?.payoutRequestId?._id?.slice(-8) || 
                       'N/A'}
                    </td>
                    <td className="py-3 text-sm text-gray-900">
                      {entry.note}
                    </td>
                    <td className="py-3 text-right font-medium">
                      {formatAmount(entry.amountTk)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
              {filteredLedger.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No ledger entries found matching your criteria.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
