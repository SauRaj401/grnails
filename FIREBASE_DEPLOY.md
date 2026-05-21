Deploy Firebase rules (Firestore + Storage)

1. Install Firebase CLI if not present:

```bash
npm install -g firebase-tools
```

2. Login and select your project (use the same Firebase project used in `src/lib/firebase.ts`):

```bash
firebase login
firebase use --add
```

3. Deploy rules only (safe for CI):

```bash
firebase deploy --only firestore:rules,storage
```

Notes
- The `firestore.rules` allow public creation of booking documents but restrict reading/updating/deleting to users with the custom claim `admin: true`.
- The `storage.rules` permit anyone to upload images under `bookings/{reference}/...` (images <= 3MB), while reads are restricted to admin users.
- For improved security, create a server-side endpoint or Cloud Function to accept uploads from anonymous users and write files with a privileged service account instead of allowing public Storage writes.

Creating an admin user and granting the `admin` claim

1. Create an email/password user in Firebase Console → Authentication.
2. From a trusted environment (Cloud Functions or your machine with Firebase Admin SDK), set a custom claim:

```js
const admin = require('firebase-admin');
admin.auth().setCustomUserClaims(uid, { admin: true });
```

Or use the Firebase CLI auth:import functionality for bulk management.

Security considerations
- Public writes to Storage are allowed by rule; consider moving uploads to a trusted backend to avoid misuse.
- Firestore `create` allows anyone to create documents; ensure you validate fields server-side if you add server processing.
