const admin = require("firebase-admin");

// Initialize Firebase Admin
try {
  const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });

  console.log("Firebase Admin initialized successfully");
} catch (error) {
  console.log("Firebase Admin initialization skipped - using mock data");
  console.log(
    "To enable Firebase, download serviceAccountKey.json from Firebase Console"
  );
}

const db = admin.firestore ? admin.firestore() : null;
const auth = admin.auth ? admin.auth() : null;

module.exports = { admin, db, auth };
