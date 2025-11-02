// firebase-admin.js (or your current file)
const admin = require("firebase-admin");

function initializeFirebase() {
  try {
    // Check if Firebase is already initialized to avoid duplicate initialization
    if (admin.apps.length > 0) {
      return admin.app();
    }

    // For Render deployment - use environment variables
    if (process.env.FIREBASE_PRIVATE_KEY) {
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
        universe_domain: "googleapis.com",
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      });
    } else {
      // Fallback for local development
      try {
        const serviceAccount = require("./serviceAccountKey.json");
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (localError) {
        console.warn(
          "⚠️ Local service account file not found, using default initialization"
        );
        // For development without service account file
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
      }
    }

    console.log("✅ Firebase Admin initialized successfully");
    return admin;
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error.message);
    // Don't throw error - allow server to start without Firebase
    console.log("🔄 Continuing without Firebase Admin...");
    return null;
  }
}

// Export the initialized app
const firebaseAdmin = initializeFirebase();
module.exports = firebaseAdmin;
