# Firestore Persistence Testing Guide

## Prerequisites
1. Admin user created in Firebase Authentication console (email + password)
2. Custom claim `admin: true` assigned to admin user
3. Firestore and Storage security rules deployed

## Quick Testing Steps

### 1. Start Dev Server
```bash
npm run dev
```
Opens http://localhost:5173

### 2. Test Public Booking (Firestore Write)
- Click on any service (e.g., "Manicure")
- Add to booking cart
- Proceed to checkout
- Fill form: Name, Email, Phone, Date/Time
- Upload a payment screenshot
- Submit booking

**What to verify:**
- Browser console shows: `[Booking] Start` → `[Booking] Uploading screenshot` → `[Booking] Screenshot uploaded` → `[Booking] Writing to Firestore` → `[Booking] Successfully saved: {reference}`
- Booking reference appears in UI
- **Firestore Console:** New document in `bookings` collection with your reference ID
- **Storage Console:** Screenshot file in `bookings/{reference}/` folder

### 3. Test Admin Login (Firebase Auth)
- Navigate to http://localhost:5173/admin/login
- Use admin credentials (email + password)
- On success: redirected to /admin/dashboard

**What to verify:**
- Login form accepts credentials
- On error: red error message (if credentials wrong)
- On success: dashboard loads with booking list

### 4. Test Admin Dashboard (Firestore Read)
**After logging in:**
- Sidebar shows all bookings with reference + name
- Click booking to view details
- Status dropdown shows current status
- Notes field editable with blur-save

**What to verify:**
- Browser console shows: `[Booking] listenToBookings` and real-time updates
- Booking details load correctly from Firestore
- Firestore console shows 1 read operation per booking view

### 5. Test Booking Status Update (Firestore Update)
- In dashboard, select booking from sidebar
- Change status dropdown (pending → confirmed)
- Blur to save

**What to verify:**
- Browser console shows: `[Booking] Updating booking status` → Success
- Firestore document `updatedAt` timestamp updates
- Status change persists on page reload

### 6. Test Booking Notes Update (Firestore Update)
- In dashboard, click notes field
- Type a note
- Click outside or blur

**What to verify:**
- Browser console shows: `[Booking] Updating booking notes` → Success
- Firestore document `updatedAt` timestamp updates
- Notes persist on page reload

### 7. Test Booking Delete (Firestore Delete)
- In dashboard, click "Delete" button
- Confirm deletion

**What to verify:**
- Browser console shows: `[Booking] Deleting booking` → Success
- Booking removed from sidebar
- Document deleted from Firestore console
- Storage file remains (can be deleted manually from console)

## Console Logging Reference

Look for these patterns in browser console (F12 → Console tab):

```
[Booking] Start: {reference, name, phone, total}
[Booking] Uploading screenshot: {filename}
[Booking] Screenshot uploaded: {url}
[Booking] Writing to Firestore
[Booking] Successfully saved: {reference}

[Booking] listenToBookings
[Booking] Received {count} bookings

[Booking] Updating booking status: {reference} → {newStatus}
[Booking] Updating booking notes: {reference}

[Booking] Deleting booking: {reference}
```

## Error Troubleshooting

If you see errors, check console for:

**"Failed to upload screenshot: ..."**
- File size > 3MB (check Storage security rule)
- Not an image file
- Network issue

**"Failed to save booking: ..."**
- Missing required field (reference, name, phone, services, total)
- Firestore write permissions issue (check security rules)
- Network issue

**"Permission denied" in Firestore reads**
- User not authenticated (login failed)
- Custom admin claim not set on user

## Performance Notes

- Each booking view triggers 1 Firestore read
- Real-time listener (listenToBookings) streams all changes (1 read per document update)
- Screenshots upload to Storage first, then Firestore write references the URL
- Booking list ordered by `createdAt DESC` (newest first)

## Next Steps

1. ✅ Create test bookings via public form
2. ✅ Verify they appear in admin dashboard
3. ✅ Test all CRUD operations
4. ✅ Check Firestore and Storage in Firebase Console
5. 🟡 Performance testing (can add Firestore.enableLogging() in firebase.ts if needed)
6. 🟡 Error recovery testing (simulate network failures)
7. 🟡 Security testing (try accessing dashboard without login)
