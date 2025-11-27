const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "a1dos-creations-25.firebaseapp.com",
  projectId: "a1dos-creations-25",
  storageBucket: "a1dos-creations-25.firebasestorage.app",
  messagingSenderId: "874801347017",
  appId: "1:874801347017:web:c8f4e6edf8ab39ba9a9018",
  measurementId: "G-3FFDJMFQ3W"
};

// Initialize Firebase
try {
  if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
  }
} catch (e) {
  console.error("Firebase initialization error:", e);
}