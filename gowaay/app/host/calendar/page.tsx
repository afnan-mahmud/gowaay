'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar as CalendarIcon,
  Home,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { format, isSameDay, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { useHostCalendar, HostUnavailableDate, HostCalendarRoom } from '@/lib/hooks/useHostData';

export default function HostCalendar() {
  const { unavailableDates, rooms, loading, error, addUnavailableDates, removeUnavailableDates } = useHostCalendar();
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newUnavailable, setNewUnavailable] = useState({
    roomId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    if (selectedRoom !== 'all') {
      const roomUnavailable = unavailableDates.filter(date => date.roomId === selectedRoom);
      const dates = roomUnavailable.map(date => new Date(date.date));
      setSelectedDates(dates);
    } else {
      setSelectedDates([]);
    }
  }, [selectedRoom, unavailableDates]);

  const handleAddUnavailable = async () => {
    if (!newUnavailable.roomId || !newUnavailable.startDate || !newUnavailable.endDate) {
      return;
    }

    try {
      // Generate array of dates between start and end
      const startDate = new Date(newUnavailable.startDate);
      const endDate = new Date(newUnavailable.endDate);
      const dates = [];
      
      for (let d = new Date(startDate); d <= endDate; d = addDays(d, 1)) {
        dates.push(format(d, 'yyyy-MM-dd'));
      }

      await addUnavailableDates(newUnavailable.roomId, dates);
      
      setNewUnavailable({
        roomId: '',
        startDate: '',
        endDate: '',
        reason: '',
      });
      setShowAddDialog(false);
    } catch (error) {
      console.error('Failed to add unavailable dates:', error);
    }
  };

  const handleDeleteUnavailable = async (unavailableDate: HostUnavailableDate) => {
    if (!confirm('Are you sure you want to remove this unavailable date?')) {
      return;
    }

    try {
      await removeUnavailableDates(unavailableDate.roomId, [unavailableDate.date]);
    } catch (error) {
      console.error('Failed to delete unavailable date:', error);
    }
  };

  const isDateUnavailable = (date: Date) => {
    if (selectedRoom === 'all') return false;
    
    return unavailableDates.some(unavailable => {
      if (unavailable.roomId !== selectedRoom) return false;
      const unavailableDate = new Date(unavailable.date);
      return isSameDay(date, unavailableDate);
    });
  };

  const getUnavailableDatesForRoom = (roomId: string) => {
    return unavailableDates.filter(date => date.roomId === roomId);
  };

  const approvedRooms = rooms || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600">Manage unavailable dates for your properties</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading calendar data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600">Manage unavailable dates for your properties</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error loading calendar data: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage unavailable dates for your properties</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Unavailable Dates
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Unavailable Dates</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Property</label>
                <Select value={newUnavailable.roomId} onValueChange={(value) => setNewUnavailable(prev => ({ ...prev, roomId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {approvedRooms.map((room) => (
                      <SelectItem key={room._id} value={room._id}>
                        {room.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <input
                    type="date"
                    value={newUnavailable.startDate}
                    onChange={(e) => setNewUnavailable(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <input
                    type="date"
                    value={newUnavailable.endDate}
                    onChange={(e) => setNewUnavailable(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Reason</label>
                <input
                  type="text"
                  value={newUnavailable.reason}
                  onChange={(e) => setNewUnavailable(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Maintenance, Personal use, Cleaning"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUnavailable}>
                  Add Dates
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Room Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Property</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a property to view calendar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {approvedRooms.map((room) => (
                <SelectItem key={room._id} value={room._id}>
                  {room.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="multiple"
              selected={selectedDates}
              className="rounded-md border"
              modifiers={{
                unavailable: (date) => isDateUnavailable(date),
              }}
              modifiersStyles={{
                unavailable: {
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  textDecoration: 'line-through',
                },
              }}
            />
            <div className="mt-4 flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-2"></div>
                <span>Unavailable dates</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unavailable Dates List */}
        <Card>
          <CardHeader>
            <CardTitle>Unavailable Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(selectedRoom === 'all' ? unavailableDates : getUnavailableDatesForRoom(selectedRoom)).map((unavailable) => (
                <div key={unavailable._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Home className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">
                        {selectedRoom === 'all' ? unavailable.roomTitle : 'Selected Property'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(unavailable.date), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Added: {format(new Date(unavailable.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUnavailable(unavailable)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {(selectedRoom === 'all' ? unavailableDates : getUnavailableDatesForRoom(selectedRoom)).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No unavailable dates set</p>
                  <p className="text-sm">Add dates when your property won't be available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Unavailable Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {unavailableDates.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Across all properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Properties with Blocked Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(unavailableDates.map(date => date.roomId)).size}
            </div>
            <p className="text-xs text-gray-500 mt-1">Out of {approvedRooms.length} properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {unavailableDates.filter(date => {
                const dateObj = new Date(date.date);
                const now = new Date();
                return dateObj.getMonth() === now.getMonth() && dateObj.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Unavailable periods</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
