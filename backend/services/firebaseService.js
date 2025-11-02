// backend/services/firebaseService.js
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Initialize Firebase Admin
const initializeFirebase = () => {
  if (!admin.apps.length) {
    try {
      const serviceAccountPath = path.join(
        __dirname,
        "../config/firebase-service-account.json"
      );

      // Check if file exists
      if (!fs.existsSync(serviceAccountPath)) {
        throw new Error("Firebase service account file not found");
      }

      const serviceAccount = require(serviceAccountPath);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
        storageBucket: `${serviceAccount.project_id}.appspot.com`,
      });

      console.log("✅ Firebase Admin initialized successfully");
      return admin.firestore();
    } catch (error) {
      console.error("❌ Firebase initialization failed:", error.message);
      throw error;
    }
  }
  return admin.firestore();
};

const db = initializeFirebase();

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

// Review operations
const reviewService = {
  // Get all reviews with optional filtering - OPTIMIZED with index
  getAllReviews: async (filters = {}) => {
    try {
      let query = db.collection("reviews");

      // Apply filters - now these will use the composite index
      if (filters.type) {
        query = query.where("type", "==", filters.type);
      }
      if (filters.itemId) {
        query = query.where("itemId", "==", filters.itemId);
      }
      if (filters.authorId) {
        query = query.where("authorId", "==", filters.authorId);
      }

      // Order by createdAt descending - this uses the composite index
      const snapshot = await query.orderBy("createdAt", "desc").get();
      const reviews = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps to ISO strings
          createdAt:
            data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt:
            data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
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
        ...data,
        createdAt:
          data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt:
          data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
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
      const updateDataWithTimestamp = {
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await reviewRef.update(updateDataWithTimestamp);

      // Get the updated review
      const updatedDoc = await reviewRef.get();
      if (!updatedDoc.exists) {
        throw new Error("Review not found after update");
      }

      const data = updatedDoc.data();
      return {
        id: updatedDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
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
        ...reviewData,
        createdAt:
          reviewData.createdAt?.toDate?.()?.toISOString() ||
          reviewData.createdAt,
        updatedAt:
          reviewData.updatedAt?.toDate?.()?.toISOString() ||
          reviewData.updatedAt,
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
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
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
  admin,
};
