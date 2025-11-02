// src/App.js
import "bootstrap/dist/css/bootstrap.min.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import About from "./pages/About";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MovieSearch from "./pages/MovieSearch";
import MyReviews from "./pages/MyReviews"; // Add this import
import RestaurantSearch from "./pages/RestaurantSearch";
import Reviews from "./pages/Reviews";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<MovieSearch />} />
              <Route path="/restaurants" element={<RestaurantSearch />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route
                path="/my-reviews"
                element={
                  <ProtectedRoute>
                    <MyReviews />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
