const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const { User, HostProfile, Room, Booking, MessageThread, Message, PaymentTransaction, PayoutRequest, AccountLedger } = require('./dist/models');

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gowaay');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await HostProfile.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});
    await MessageThread.deleteMany({});
    await Message.deleteMany({});
    await PaymentTransaction.deleteMany({});
    await PayoutRequest.deleteMany({});
    await AccountLedger.deleteMany({});
    console.log('Cleared existing data');

    // 1. Create Admin User
    const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 12);
    const adminUser = new User({
      email: 'admin@gowaay.com',
      passwordHash: adminPasswordHash,
      name: 'Admin User',
      phone: '01700000001',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await adminUser.save();
    console.log('✅ Created admin user');

    // 2. Create Approved Host User
    const hostPasswordHash = await bcrypt.hash('HostPassword123!', 12);
    const hostUser = new User({
      email: 'host@gowaay.com',
      passwordHash: hostPasswordHash,
      name: 'Rahim Ahmed',
      phone: '01700000002',
      role: 'host',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await hostUser.save();
    console.log('✅ Created host user');

    // 3. Create Pending Host User
    const pendingHostPasswordHash = await bcrypt.hash('PendingHost123!', 12);
    const pendingHostUser = new User({
      email: 'pendinghost@gowaay.com',
      passwordHash: pendingHostPasswordHash,
      name: 'Karim Uddin',
      phone: '01700000003',
      role: 'host',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await pendingHostUser.save();
    console.log('✅ Created pending host user');

    // 4. Create Regular Guest User
    const guestPasswordHash = await bcrypt.hash('GuestPassword123!', 12);
    const guestUser = new User({
      email: 'guest@gowaay.com',
      passwordHash: guestPasswordHash,
      name: 'Fatima Begum',
      phone: '01700000004',
      role: 'guest',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await guestUser.save();
    console.log('✅ Created guest user');

    // 5. Create Approved Host Profile
    const approvedHostProfile = new HostProfile({
      userId: hostUser._id,
      displayName: 'Rahim\'s Premium Properties',
      phone: '01700000002',
      whatsapp: '01700000002',
      locationName: 'Dhanmondi, Dhaka',
      locationMapUrl: 'https://maps.google.com/?q=Dhanmondi,Dhaka',
      nidFrontUrl: 'https://example.com/nid-front.jpg',
      nidBackUrl: 'https://example.com/nid-back.jpg',
      status: 'approved',
      propertyCount: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await approvedHostProfile.save();
    console.log('✅ Created approved host profile');

    // 6. Create Pending Host Profile
    const pendingHostProfile = new HostProfile({
      userId: pendingHostUser._id,
      displayName: 'Karim\'s Cozy Homes',
      phone: '01700000003',
      whatsapp: '01700000003',
      locationName: 'Chittagong, Bangladesh',
      locationMapUrl: 'https://maps.google.com/?q=Chittagong,Bangladesh',
      nidFrontUrl: 'https://example.com/nid-front-pending.jpg',
      nidBackUrl: 'https://example.com/nid-back-pending.jpg',
      status: 'pending',
      propertyCount: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await pendingHostProfile.save();
    console.log('✅ Created pending host profile');

    // 7. Create 3 Approved Rooms
    const rooms = [
      {
        hostId: approvedHostProfile._id,
        title: 'Luxury Family Suite in Dhanmondi',
        description: 'Beautiful 3-bedroom suite with modern amenities, located in the heart of Dhanmondi. Perfect for families and business travelers.',
        address: 'House 15, Road 7, Dhanmondi, Dhaka 1205',
        locationName: 'Dhanmondi, Dhaka',
        roomType: 'family',
        amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Parking', 'Balcony', 'Washing Machine'],
        basePriceTk: 5000,
        commissionTk: 500,
        totalPriceTk: 5500,
        images: [
          { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', w: 800, h: 600 },
          { url: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800', w: 800, h: 600 },
          { url: 'https://images.unsplash.com/photo-1560448204-5c6a6a6a6a6a?w=800', w: 800, h: 600 }
        ],
        status: 'approved',
        instantBooking: true,
        unavailableDates: []
      },
      {
        hostId: approvedHostProfile._id,
        title: 'Cozy Single Room in Gulshan',
        description: 'Modern single room with city view, ideal for solo travelers. Close to diplomatic area and business district.',
        address: 'House 25, Road 11, Gulshan 1, Dhaka 1212',
        locationName: 'Gulshan, Dhaka',
        roomType: 'single',
        amenities: ['WiFi', 'Air Conditioning', 'City View', 'Elevator'],
        basePriceTk: 3500,
        commissionTk: 350,
        totalPriceTk: 3850,
        images: [
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', w: 800, h: 600 },
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', w: 800, h: 600 }
        ],
        status: 'approved',
        instantBooking: false,
        unavailableDates: []
      },
      {
        hostId: approvedHostProfile._id,
        title: 'Spacious Family House in Uttara',
        description: 'Large 4-bedroom house perfect for big families. Features garden, multiple bathrooms, and modern kitchen.',
        address: 'Sector 7, House 45, Uttara, Dhaka 1230',
        locationName: 'Uttara, Dhaka',
        roomType: 'family',
        amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Garden', 'Parking', 'Multiple Bathrooms', 'Washing Machine'],
        basePriceTk: 8000,
        commissionTk: 800,
        totalPriceTk: 8800,
        images: [
          { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', w: 800, h: 600 },
          { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', w: 800, h: 600 },
          { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', w: 800, h: 600 }
        ],
        status: 'approved',
        instantBooking: true,
        unavailableDates: []
      }
    ];

    const savedRooms = [];
    for (const roomData of rooms) {
      const room = new Room(roomData);
      const savedRoom = await room.save();
      savedRooms.push(savedRoom);
    }
    console.log('✅ Created 3 approved rooms');

    // 8. Create 1 Pending Room
    const pendingRoom = new Room({
      hostId: pendingHostProfile._id,
      title: 'Beach View Suite in Cox\'s Bazar',
      description: 'Beautiful suite with stunning beach views, perfect for vacation rentals. Close to the beach and local attractions.',
      address: 'Marine Drive, Cox\'s Bazar 4700',
      locationName: 'Cox\'s Bazar, Bangladesh',
      roomType: 'suite',
      amenities: ['WiFi', 'Air Conditioning', 'Beach View', 'Kitchen', 'Balcony'],
      basePriceTk: 6000,
      commissionTk: 600,
      totalPriceTk: 6600,
      images: [
        { url: 'https://images.unsplash.com/photo-1571896349842-33c89436de2d?w=800', w: 800, h: 600 },
        { url: 'https://images.unsplash.com/photo-1571896349842-33c89436de2d?w=800', w: 800, h: 600 }
      ],
      status: 'pending',
      instantBooking: false,
      unavailableDates: []
    });
    await pendingRoom.save();
    console.log('✅ Created 1 pending room');

    // 9. Create Sample Booking
    const sampleBooking = new Booking({
      roomId: savedRooms[0]._id,
      userId: guestUser._id,
      hostId: approvedHostProfile._id,
      checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      guests: 2,
      mode: 'instant',
      status: 'confirmed',
      transactionId: 'TXN_' + Date.now(),
      paymentStatus: 'paid',
      amountTk: 16500, // 3 nights * 5500
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await sampleBooking.save();
    console.log('✅ Created sample booking');

    // 10. Create Account Ledger Entries
    const ledgerEntries = [
      {
        type: 'commission',
        ref: { bookingId: sampleBooking._id },
        amountTk: 1500, // 3 nights * 500 commission
        note: 'Commission from booking',
        at: new Date()
      },
      {
        type: 'adjustment',
        amountTk: 10000,
        note: 'Initial platform balance',
        at: new Date()
      }
    ];

    for (const entry of ledgerEntries) {
      const ledger = new AccountLedger(entry);
      await ledger.save();
    }
    console.log('✅ Created account ledger entries');

    // 11. Create Sample Payout Request
    const payoutRequest = new PayoutRequest({
      hostId: approvedHostProfile._id,
      method: {
        type: 'bkash',
        subtype: 'personal',
        accountNo: '01700000002'
      },
      amountTk: 5000,
      status: 'pending'
    });
    await payoutRequest.save();
    console.log('✅ Created sample payout request');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- 1 Admin user: admin@gowaay.com');
    console.log('- 1 Approved host: host@gowaay.com');
    console.log('- 1 Pending host: pendinghost@gowaay.com');
    console.log('- 1 Guest user: guest@gowaay.com');
    console.log('- 3 Approved rooms');
    console.log('- 1 Pending room');
    console.log('- 1 Sample booking');
    console.log('- Account ledger entries');
    console.log('- 1 Payout request');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedData();
