# Payment Setup Documentation

## Current Status: Manual Payment (bKash/Nagad)

এই document এ manual payment setup এবং পরবর্তীতে SSLCommerz restore করার সম্পূর্ণ নির্দেশনা রয়েছে।

---

## 📱 Manual Payment Flow (বর্তমান)

### কিভাবে কাজ করে:

1. **User clicks "Confirm and Pay"** → Booking তৈরি হয়
2. **Redirect to Manual Payment Page** → `/payment/manual?bookingId=XXX&amount=XXX`
3. **Payment Instructions দেখানো হয়**:
   - bKash/Nagad এ 01611553628 নম্বরে Send Money করতে হবে
   - TXN ID input field এ transaction ID দিতে হবে
4. **User confirms with TXN ID** → Booking confirmed হয়ে যায়
5. **Redirect to Success Page** → `/booking/success?bookingId=XXX`

### Modified Files:

#### Frontend:
1. ✅ `gowaay/app/(public)/booking/details/page.tsx` - SSL commented, manual flow added
2. ✅ `gowaay/app/(public)/payment/page.tsx` - SSL commented (legacy page)
3. ✅ `gowaay/app/(public)/payment/manual/page.tsx` - **NEW** manual payment page
4. ✅ `gowaay/lib/api.ts` - Added `confirmManual` endpoint

#### Backend:
5. ✅ `gowaay-server/src/routes/payments.ts` - Added manual payment confirmation route

---

## 🔄 SSLCommerz Restore করার নির্দেশনা

যখন SSLCommerz আবার সেটআপ করতে চাইবেন:

### Step 1: Frontend - Booking Details Page Restore

**File:** `gowaay/app/(public)/booking/details/page.tsx`

Line 130-148 এ commented code রয়েছে। এই changes করুন:

```typescript
// BEFORE (Manual Payment - Current):
const handleConfirmAndPay = async () => {
  // ... booking creation code ...
  
  // Manual Payment Flow (bKash/Nagad)
  // Redirect to manual payment page
  const paymentUrl = `/payment/manual?bookingId=${bookingId}&amount=${calculateTotal()}`;
  window.location.href = paymentUrl;
}

// AFTER (SSLCommerz Restored):
const handleConfirmAndPay = async () => {
  // ... booking creation code ...
  
  // SSLCommerz Integration
  const paymentResponse = await api.payments.initSsl({ bookingId });
  
  if (paymentResponse.success && paymentResponse.data?.gatewayUrl) {
    // Redirect to SSLCommerz payment gateway
    window.location.href = paymentResponse.data.gatewayUrl;
  } else {
    const errorMsg = paymentResponse.error || paymentResponse.message || 'Failed to initialize payment.';
    toast.error(errorMsg);
    setProcessing(false);
  }
}
```

### Step 2: Delete/Disable Manual Payment Page (Optional)

**File:** `gowaay/app/(public)/payment/manual/page.tsx`

আপনি চাইলে এই page টা রাখতে পারেন backup হিসেবে, অথবা delete করে দিতে পারেন:

```bash
rm gowaay/app/(public)/payment/manual/page.tsx
```

### Step 3: Backend Manual Route (Optional)

**File:** `gowaay-server/src/routes/payments.ts`

Manual payment route (line 430-547) রাখতে পারেন future backup এর জন্য। এটা SSLCommerz এর সাথে conflict করবে না।

---

## 🔧 Testing Manual Payment

### Test করার জন্য:

1. একটা room book করুন
2. "Confirm and Pay" button এ click করুন
3. Manual payment page এ redirect হবে
4. Phone number copy করুন: **01611553628**
5. bKash/Nagad এ send money করুন
6. TXN ID (যেমন: BKH12345ABCD) enter করুন
7. "Confirm Payment" click করুন
8. Success page এ redirect হবে

### Database এ Check করুন:

```javascript
// MongoDB
db.bookings.find({ status: 'confirmed', paymentStatus: 'paid' })
db.paymenttransactions.find({ gateway: 'manual' })
```

---

## 📝 Important Notes

### Manual Payment এর Features:

✅ **Commission**: Automatically calculate and save হয়  
✅ **Booking Status**: Instant confirmed  
✅ **Payment Record**: Transaction ID database এ save হয়  
✅ **Account Ledger**: Commission entry automatically create হয়  
✅ **No Gateway Fee**: কোনো payment gateway fee নেই  

### SSLCommerz এর Features:

✅ **Multiple Payment Methods**: bKash, Nagad, Rocket, Cards, Banking  
✅ **Automatic Verification**: Payment auto-verify হয়  
✅ **IPN Support**: Instant Payment Notification  
✅ **Refund Support**: Built-in refund system  
✅ **Security**: PCI DSS compliant  

---

## 🚀 Quick Restore Commands

যখন SSLCommerz restore করবেন, এই commands run করুন:

```bash
# Frontend
cd gowaay
pnpm build
pnpm start

# Backend
cd gowaay-server
npm run build
npm start
```

---

## 💡 Contact for Support

এই setup নিয়ে কোনো সমস্যা হলে:
- Check console logs (browser & server)
- Review this documentation
- Test in development mode first

---

## 📊 Payment Flow Comparison

| Feature | Manual Payment | SSLCommerz |
|---------|---------------|------------|
| Setup Time | Instant | Requires merchant account |
| Payment Methods | bKash/Nagad only | All methods |
| Verification | Manual TXN ID | Automatic |
| Security | User responsibility | PCI compliant |
| Fees | None | Gateway charges apply |
| Refunds | Manual process | Automated |
| Recommended For | Testing/Backup | Production |

---

**Document Version:** 1.0  
**Last Updated:** November 12, 2025  
**Status:** ✅ Manual Payment Active, SSLCommerz Commented

