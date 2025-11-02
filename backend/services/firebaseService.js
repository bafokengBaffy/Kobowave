const admin = require("firebase-admin");

// Initialize Firebase Admin
const initializeFirebase = () => {
  if (!admin.apps.length) {
    try {
      let serviceAccount;

      // Check for environment variables first (for production)
      if (process.env.FIREBASE_PRIVATE_KEY) {
        console.log("Using environment variables for Firebase configuration");

        serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID || "kobowave",
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
      } else {
        // For local development - try to use service account file
        console.log("Using service account file for Firebase configuration");

        // Try to require the service account file
        try {
          serviceAccount = require("../config/firebase-service-account.json");
        } catch (fileError) {
          throw new Error(
            "Firebase service account file not found and no environment variables configured. " +
              "Please set FIREBASE_PRIVATE_KEY environment variable or add service account file."
          );
        }
      }

      // Validate required service account fields
      if (!serviceAccount.project_id) {
        throw new Error("Firebase project ID is required");
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
        storageBucket: `${serviceAccount.project_id}.appspot.com`,
      });

      console.log("✅ Firebase Admin initialized successfully");
      return admin;
    } catch (error) {
      console.error("❌ Firebase initialization failed:", error.message);
      throw error;
    }
  }
  return admin;
};

const firebaseApp = initializeFirebase();
const db = firebaseApp.firestore();

// Auto-create collections if they don't exist
const initializeCollections = async () => {
  const collections = ["reviews", "movies", "restaurants", "users"];

  console.log("🔄 Initializing Firebase collections...");

  for (const collectionName of collections) {
    try {
      const collectionRef = db.collection(collectionName);
      const snapshot = await collectionRef.limit(1).get();

      if (snapshot.empty) {
        console.log(`✅ Created collection: ${collectionName}`);
        // Use regular Date instead of serverTimestamp for initialization
        await collectionRef.doc("init").set({
          initialized: true,
          createdAt: new Date().toISOString(),
          message: `Collection ${collectionName} initialized`,
        });
      } else {
        console.log(
          `✅ Collection exists: ${collectionName} (${snapshot.size} documents)`
        );
      }
    } catch (error) {
      console.error(
        `❌ Error initializing collection ${collectionName}:`,
        error.message
      );
    }
  }

  console.log("✅ All collections initialized");
};

// Helper function to convert Firestore data to plain objects
const convertFirestoreTimestamps = (data) => {
  if (!data) return data;

  const converted = { ...data };

  // Convert Firestore Timestamps to ISO strings
  if (converted.createdAt && typeof converted.createdAt.toDate === "function") {
    converted.createdAt = converted.createdAt.toDate().toISOString();
  }

  if (converted.updatedAt && typeof converted.updatedAt.toDate === "function") {
    converted.updatedAt = converted.updatedAt.toDate().toISOString();
  }

  return converted;
};

// Review operations
const reviewService = {
  // Get all reviews with optional filtering
  getAllReviews: async (filters = {}) => {
    try {
      let query = db.collection("reviews");

      // Apply filters
      if (filters.type) {
        query = query.where("type", "==", filters.type);
      }
      if (filters.itemId) {
        query = query.where("itemId", "==", filters.itemId);
      }
      if (filters.authorId) {
        query = query.where("authorId", "==", filters.authorId);
      }

      // Order by createdAt descending
      const snapshot = await query.orderBy("createdAt", "desc").get();
      const reviews = [];

      snapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...convertFirestoreTimestamps(doc.data()),
        });
      });

      return reviews;
    } catch (error) {
      console.error("Error getting reviews:", error);
      throw error;
    }
  },

  // Get reviews by movie ID
  getReviewsByMovie: async (movieId) => {
    return reviewService.getAllReviews({ type: "movie", itemId: movieId });
  },

  // Get reviews by restaurant ID
  getReviewsByRestaurant: async (restaurantId) => {
    return reviewService.getAllReviews({
      type: "restaurant",
      itemId: restaurantId,
    });
  },

  // Create a new review
  createReview: async (reviewData) => {
    try {
      const reviewRef = db.collection("reviews").doc();
      const review = {
        id: reviewRef.id,
        ...reviewData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await reviewRef.set(review);

      // Get the created review with proper timestamps
      const createdDoc = await reviewRef.get();
      const data = createdDoc.data();

      return {
        id: createdDoc.id,
        ...convertFirestoreTimestamps(data),
      };
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  },

  // Update a review
  updateReview: async (reviewId, updateData) => {
    try {
      const reviewRef = db.collection("reviews").doc(reviewId);

      // Check if review exists
      const reviewDoc = await reviewRef.get();
      if (!reviewDoc.exists) {
        throw new Error("Review not found");
      }

      const updateDataWithTimestamp = {
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await reviewRef.update(updateDataWithTimestamp);

      // Get the updated review
      const updatedDoc = await reviewRef.get();
      const data = updatedDoc.data();

      return {
        id: updatedDoc.id,
        ...convertFirestoreTimestamps(data),
      };
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      const reviewRef = db.collection("reviews").doc(reviewId);
      const reviewDoc = await reviewRef.get();

      if (!reviewDoc.exists) {
        throw new Error("Review not found");
      }

      const reviewData = reviewDoc.data();
      await reviewRef.delete();

      return {
        id: reviewId,
        ...convertFirestoreTimestamps(reviewData),
      };
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  },

  // Get review by ID
  getReviewById: async (reviewId) => {
    try {
      const reviewRef = db.collection("reviews").doc(reviewId);
      const reviewDoc = await reviewRef.get();

      if (!reviewDoc.exists) {
        return null;
      }

      const data = reviewDoc.data();
      return {
        id: reviewDoc.id,
        ...convertFirestoreTimestamps(data),
      };
    } catch (error) {
      console.error("Error getting review:", error);
      throw error;
    }
  },
};

module.exports = {
  db,
  initializeCollections,
  reviewService,
  admin: firebaseApp,
};
