// src/pages/RestaurantSearch.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Modal,
  Button,
  Card,
  Badge,
} from "react-bootstrap";
import { restaurantAPI } from "../services/api";

const RestaurantSearch = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadRestaurants = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await restaurantAPI.getAll();
      // Handle different response structures
      const restaurantsData = response.data?.data || response.data || [];
      setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to load restaurants.";
      setError(errorMessage);
      console.error("Restaurant load error:", err);

      // If it's a 404, suggest checking the backend
      if (err.response?.status === 404) {
        setError(
          "Restaurants endpoint not found. Please make sure the backend server is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      loadRestaurants(); // Reload all restaurants if search is empty
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await restaurantAPI.search(query);
      // Handle different response structures
      const restaurantsData = response.data?.data || response.data || [];
      setRestaurants(Array.isArray(restaurantsData) ? restaurantsData : []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to search restaurants. Please try again.";
      setError(errorMessage);
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowModal(true);
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  // Restaurant Card Component
  const RestaurantCard = ({ restaurant, onViewDetails }) => (
    <Card className="h-100 shadow-sm">
      <Card.Body className="d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="flex-grow-1" style={{ fontSize: "1.1rem" }}>
            {restaurant.name}
          </Card.Title>
          <Badge bg="success">⭐ {restaurant.rating || "N/A"}</Badge>
        </div>

        <Card.Text className="text-muted mb-2">
          <strong>Cuisine:</strong> {restaurant.cuisine}
        </Card.Text>

        <Card.Text className="text-muted mb-2">
          <strong>Location:</strong> 📍 {restaurant.location}
        </Card.Text>

        {restaurant.priceRange && (
          <Card.Text className="text-muted mb-3">
            <strong>Price:</strong> {restaurant.priceRange}
          </Card.Text>
        )}

        <div className="mt-auto">
          <Button
            variant="success"
            size="sm"
            onClick={() => onViewDetails(restaurant)}
            className="w-100"
          >
            View Details
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  // Search Bar Component
  const SearchBar = ({ onSearch, placeholder, loading }) => {
    const [query, setQuery] = useState("");

    const handleSubmit = (e) => {
      e.preventDefault();
      onSearch(query);
    };

    return (
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn btn-success"
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </button>
        </div>
      </form>
    );
  };

  return (
    <Container className="my-4">
      <Row>
        <Col>
          <h1 className="text-center mb-4">🍽️ Restaurant Search</h1>
          <p className="text-center text-muted mb-4">
            Discover great restaurants and share your dining experiences
          </p>

          <SearchBar
            onSearch={handleSearch}
            placeholder="Search restaurants by name, cuisine, or location..."
            loading={loading}
          />

          {error && (
            <Alert variant="danger" className="text-center">
              {error}
              <div className="mt-2">
                <small>
                  Make sure your backend server is running on
                  http://localhost:5000
                </small>
              </div>
            </Alert>
          )}

          {/* Restaurants List */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Featured Restaurants</h4>
              <Button
                variant="outline-success"
                size="sm"
                onClick={loadRestaurants}
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : "Refresh"}
              </Button>
            </div>

            {loading && restaurants.length === 0 ? (
              <div className="text-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Loading restaurants...</p>
              </div>
            ) : (
              <Row>
                {restaurants.map((restaurant, index) => (
                  <Col
                    key={restaurant.id || `restaurant-${index}`}
                    lg={4}
                    md={6}
                    className="mb-4"
                  >
                    <RestaurantCard
                      restaurant={restaurant}
                      onViewDetails={handleViewDetails}
                    />
                  </Col>
                ))}
              </Row>
            )}

            {!loading && restaurants.length === 0 && !error && (
              <Alert variant="info" className="text-center">
                No restaurants found. Try a different search term.
              </Alert>
            )}
          </div>
        </Col>
      </Row>

      {/* Restaurant Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedRestaurant?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRestaurant && (
            <div>
              <div className="mb-3">
                <strong>Cuisine:</strong> {selectedRestaurant.cuisine}
              </div>
              <div className="mb-3">
                <strong>Location:</strong> 📍 {selectedRestaurant.location}
              </div>
              <div className="mb-3">
                <strong>Price Range:</strong> {selectedRestaurant.priceRange}
              </div>
              <div className="mb-3">
                <strong>Rating:</strong>{" "}
                {"⭐".repeat(Math.floor(selectedRestaurant.rating || 0))}
                {"☆".repeat(5 - Math.floor(selectedRestaurant.rating || 0))}(
                {selectedRestaurant.rating || "No ratings"})
              </div>
              <div className="mb-3">
                <strong>Description:</strong>
                <p className="mt-1">{selectedRestaurant.description}</p>
              </div>

              <div className="d-flex gap-2">
                <Button variant="success" className="me-2">
                  Write a Review
                </Button>
                <Button variant="outline-primary">Read Reviews</Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default RestaurantSearch;
