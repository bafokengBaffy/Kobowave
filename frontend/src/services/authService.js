import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

// Create user in Firestore
const createUserInFirestore = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    const { email, displayName, photoURL } = user;
    const createdAt = new Date();

    try {
      await setDoc(userRef, {
        uid: user.uid,
        email,
        displayName:
          displayName || additionalData.displayName || email.split("@")[0],
        photoURL: photoURL || "",
        createdAt,
        updatedAt: createdAt,
        ...additionalData,
      });
      console.log("User created in Firestore:", user.uid);
    } catch (error) {
      console.error("Error creating user in Firestore:", error);
    }
  }
};

// Register new user
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update profile with display name
    await updateProfile(user, {
      displayName: displayName,
    });

    // Create user document in Firestore
    await createUserInFirestore(user, { displayName });

    return { success: true, user };
  } catch (error) {
    let errorMessage = "Registration failed. Please try again.";

    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "Email is already registered.";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address.";
        break;
      case "auth/weak-password":
        errorMessage = "Password should be at least 6 characters.";
        break;
      default:
        errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Ensure user exists in Firestore
    await createUserInFirestore(user);

    return { success: true, user };
  } catch (error) {
    let errorMessage = "Login failed. Please try again.";

    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "No account found with this email.";
        break;
      case "auth/wrong-password":
        errorMessage = "Incorrect password.";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address.";
        break;
      case "auth/user-disabled":
        errorMessage = "This account has been disabled.";
        break;
      default:
        errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get current user
export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Update user profile
export const updateUserProfile = async (updates) => {
  const user = auth.currentUser;

  if (!user) {
    return { success: false, error: "No user logged in" };
  }

  try {
    // Update Firebase Auth profile
    if (updates.displayName || updates.photoURL) {
      await updateProfile(user, {
        displayName: updates.displayName,
        photoURL: updates.photoURL,
      });
    }

    // Update Firestore user document
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user data from Firestore
export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      return { success: true, data: userSnapshot.data() };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};
