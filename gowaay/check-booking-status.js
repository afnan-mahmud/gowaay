// Quick script to check booking statuses in console
const checkBooking = (booking) => {
  console.log('=== Booking Debug ===');
  console.log('Booking ID:', booking._id);
  console.log('Status:', booking.status);
  console.log('Payment Status:', booking.paymentStatus);
  console.log('Transaction ID:', booking.transactionId);
  console.log('Will show host info?', booking.status === 'confirmed' && booking.paymentStatus === 'paid');
  console.log('==================');
};

// Copy this to browser console and run: checkBooking(bookings[0])
