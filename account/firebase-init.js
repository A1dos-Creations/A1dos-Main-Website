const firebaseConfig = {
  apiKey: "AIzaSyDN1E5nYSj0aJQ66EEFf8NGH3lkDy64Cf8",
  authDomain: "a1dos-creations-25.firebaseapp.com",
  projectId: "a1dos-creations-25",
  storageBucket: "a1dos-creations-25.appspot.com",
  messagingSenderId: "874801347017",
  appId: "1:874801347017:web:34cfce97e3eee8479a9018",
  measurementId: "G-7JBQ0CWX91"
};

// Initialize Firebase
try {
  if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
  }
} catch (e) {
  console.error("Firebase initialization error:", e);
}