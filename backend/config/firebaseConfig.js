const admin = require("firebase-admin");

function initializeFirebase() {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      console.log("✅ Firebase already initialized");
      return admin.app();
    }

    // For Render deployment - use environment variables
    if (process.env.FIREBASE_PRIVATE_KEY) {
      console.log("🔧 Initializing Firebase with environment variables...");

      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
      });
    } else {
      console.log("🔧 Initializing Firebase with default credentials...");
      // For development without service account
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }

    console.log("✅ Firebase Admin initialized successfully");
    return admin;
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error.message);
    console.log("🔄 Continuing without Firebase Admin...");
    return null;
  }
}

module.exports = initializeFirebase();
