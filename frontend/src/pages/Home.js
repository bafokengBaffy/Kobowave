// src/pages/Home.js
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Row,
  Spinner,
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import ReviewCard from "../components/ReviewCard";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import { movieAPI, restaurantAPI, reviewAPI } from "../services/api";

const Home = () => {
  const [stats, setStats] = useState({
    moviesReviewed: 0,
    restaurantsListed: 0,
    communityReviews: 0,
    activeUsers: 0,
  });
  const [recentReviews, setRecentReviews] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();

  // Add ref to prevent duplicate calls
  const hasLoadedRef = useRef(false);

  const features = [
    {
      id: "feature-movies",
      icon: "🎬",
      title: "Movie Reviews",
      description:
        "Discover and review the latest movies from around the world.",
      link: "/movies",
      buttonText: "Explore Movies",
      variant: "primary",
    },
    {
      id: "feature-restaurants",
      icon: "🍽️",
      title: "Restaurant Reviews",
      description: "Find and review great restaurants in your area.",
      link: "/restaurants",
      buttonText: "Find Restaurants",
      variant: "success",
    },
    {
      id: "feature-community",
      icon: "⭐",
      title: "Community Reviews",
      description: "Read reviews from our community of food and movie lovers.",
      link: "/reviews",
      buttonText: "Read Reviews",
      variant: "info",
    },
  ];

  // Fetch real data from APIs and Firebase
  useEffect(() => {
    const fetchHomeData = async () => {
      // Prevent duplicate calls in development
      if (hasLoadedRef.current) return;
      hasLoadedRef.current = true;

      try {
        setLoading(true);
        setError("");

        console.log("🏠 Starting to fetch home page data...");

        // Fetch data from all APIs
        const [reviewsData, moviesData, restaurantsData, usersSnapshot] =
          await Promise.all([
            reviewAPI.getAll(),
            movieAPI.getPopular(),
            restaurantAPI.getAll(),
            getDocs(collection(db, "users")),
          ]);

        console.log("✅ Home data loaded:", {
          movies: moviesData,
          restaurants: restaurantsData,
          reviews: reviewsData,
          users: usersSnapshot.size,
        });

        // Process and set data
        setRecentReviews(
          Array.isArray(reviewsData) ? reviewsData.slice(0, 3) : []
        );
        setPopularMovies(
          Array.isArray(moviesData) ? moviesData.slice(0, 6) : []
        );
        setFeaturedRestaurants(
          Array.isArray(restaurantsData) ? restaurantsData.slice(0, 3) : []
        );

        // Calculate stats
        const movieReviews = Array.isArray(reviewsData)
          ? reviewsData.filter((review) => review.type === "movie").length
          : 0;

        setStats({
          moviesReviewed: movieReviews,
          restaurantsListed: Array.isArray(restaurantsData)
            ? restaurantsData.length
            : 0,
          communityReviews: Array.isArray(reviewsData) ? reviewsData.length : 0,
          activeUsers: usersSnapshot.size,
        });
      } catch (err) {
        console.error("❌ Error fetching home data:", err);
        setError(
          "Some features may not be available due to connection issues."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Movie Card Component
  const MovieCard = ({ movie }) => {
    if (!movie) return null;

    // Safely extract movie data
    const movieData = {
      id: movie.imdbID || movie.id || `movie-${Math.random()}`,
      title: movie.Title || movie.title || "Unknown Title",
      year: movie.Year || movie.Year || "N/A",
      poster:
        movie.Poster && movie.Poster !== "N/A"
          ? movie.Poster
          : "/placeholder-movie.jpg",
      rating: movie.imdbRating || movie.vote_average || "N/A",
      type: movie.Type || "movie",
    };

    return (
      <Card className="h-100 shadow-sm movie-card">
        <Card.Img
          variant="top"
          src={movieData.poster}
          alt={movieData.title}
          style={{ height: "250px", objectFit: "cover" }}
          onError={(e) => {
            e.target.src = "/placeholder-movie.jpg";
          }}
        />
        <Card.Body className="d-flex flex-column">
          <Card.Title
            className="h6 flex-grow-1"
            style={{ fontSize: "0.9rem", minHeight: "40px" }}
          >
            {movieData.title}
          </Card.Title>
          <div className="d-flex justify-content-between align-items-center mt-auto">
            <Badge bg="secondary">{movieData.year}</Badge>
            <div className="text-warning small">
              ⭐{" "}
              {typeof movieData.rating === "number"
                ? movieData.rating.toFixed(1)
                : movieData.rating}
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // Restaurant Card Component
  const RestaurantCard = ({ restaurant }) => {
    if (!restaurant) return null;

    // Handle different restaurant data structures
    const restaurantData = {
      id: restaurant.id || `restaurant-${Math.random()}`,
      name: restaurant.name || "Unknown Restaurant",
      cuisine: restaurant.cuisine || restaurant.type || "Various Cuisine",
      priceRange: restaurant.priceRange || restaurant.price_range || "$$",
      location:
        restaurant.location || restaurant.address || "Location not specified",
      rating: restaurant.rating || restaurant.average_rating || 0,
    };

    return (
      <Card className="h-100 shadow-sm restaurant-card">
        <Card.Body className="d-flex flex-column">
          <Card.Title className="h6" style={{ minHeight: "40px" }}>
            {restaurantData.name}
          </Card.Title>

          <div className="mb-2">
            <Badge bg="success" className="me-1">
              {restaurantData.cuisine}
            </Badge>
            <Badge bg="outline-secondary">{restaurantData.priceRange}</Badge>
          </div>

          <Card.Text className="small text-muted mb-2 flex-grow-1">
            📍 {restaurantData.location}
          </Card.Text>

          <div className="text-warning mt-auto">
            {"⭐".repeat(Math.floor(restaurantData.rating))}
            {"☆".repeat(5 - Math.floor(restaurantData.rating))}
            <span className="text-muted ms-1">({restaurantData.rating})</span>
          </div>
        </Card.Body>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col className="text-center">
            <Spinner animation="border" variant="primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading KoboWave...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Welcome to <span className="text-warning">Kobo</span>
                <span className="text-info">Wave</span>
              </h1>
              <p className="lead mb-4">
                Your ultimate destination for movie and restaurant reviews. Join
                our community and discover new experiences.
              </p>
              <div className="hero-buttons">
                <LinkContainer to="/movies">
                  <Button variant="warning" size="lg" className="me-3 mb-2">
                    🎬 Explore Movies
                  </Button>
                </LinkContainer>
                <LinkContainer to="/restaurants">
                  <Button variant="info" size="lg" className="me-3 mb-2">
                    🍽️ Find Restaurants
                  </Button>
                </LinkContainer>
                <LinkContainer to="/reviews">
                  <Button variant="outline-light" size="lg" className="mb-2">
                    📝 Read Reviews
                  </Button>
                </LinkContainer>
              </div>
              {!currentUser && (
                <div className="mt-3">
                  <LinkContainer to="/signup">
                    <Button variant="outline-light" size="sm">
                      👤 Join Our Community
                    </Button>
                  </LinkContainer>
                </div>
              )}
            </Col>
            <Col lg={6}>
              <div className="text-center">
                <div className="bg-light rounded p-4 text-dark shadow">
                  <h4 className="mb-4">📊 Community Stats</h4>
                  <Row>
                    <Col xs={6} className="mb-3">
                      <h3 className="text-primary fw-bold mb-1">
                        {stats.moviesReviewed}
                      </h3>
                      <small className="text-muted">Movie Reviews</small>
                    </Col>
                    <Col xs={6} className="mb-3">
                      <h3 className="text-success fw-bold mb-1">
                        {stats.restaurantsListed}
                      </h3>
                      <small className="text-muted">Restaurants</small>
                    </Col>
                    <Col xs={6} className="mb-3">
                      <h3 className="text-info fw-bold mb-1">
                        {stats.communityReviews}
                      </h3>
                      <small className="text-muted">Total Reviews</small>
                    </Col>
                    <Col xs={6} className="mb-3">
                      <h3 className="text-warning fw-bold mb-1">
                        {stats.activeUsers}
                      </h3>
                      <small className="text-muted">Active Users</small>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {error && (
        <Container className="mt-4">
          <Alert variant="warning" className="text-center">
            {error}
          </Alert>
        </Container>
      )}

      {/* Debug Info - Remove in production */}
      <Container className="mt-3">
        <Alert variant="info" className="small">
          <strong>🔧 Debug Info:</strong> Movies: {popularMovies.length} |
          Restaurants: {featuredRestaurants.length} | Reviews:{" "}
          {recentReviews.length}
        </Alert>
      </Container>

      {/* Features Section */}
      <section className="features-section py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="fw-bold">Why Choose KoboWave?</h2>
              <p className="text-muted">
                The perfect platform for both movie buffs and food enthusiasts
              </p>
            </Col>
          </Row>
          <Row>
            {features.map((feature) => (
              <Col md={4} key={feature.id} className="mb-4">
                <Card className="h-100 border-0 shadow-sm feature-card">
                  <Card.Body className="text-center p-4">
                    <div
                      className="feature-icon bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <h2 className="mb-0">{feature.icon}</h2>
                    </div>
                    <Card.Title className="h5">{feature.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {feature.description}
                    </Card.Text>
                    <LinkContainer to={feature.link}>
                      <Button variant={feature.variant}>
                        {feature.buttonText}
                      </Button>
                    </LinkContainer>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Recent Reviews Section */}
      <section className="py-5">
        <Container>
          <Row className="mb-4">
            <Col>
              <h2 className="fw-bold">Recent Community Reviews</h2>
              <p className="text-muted">See what our community is saying</p>
            </Col>
            <Col xs="auto">
              <LinkContainer to="/reviews">
                <Button variant="outline-primary" size="sm">
                  View All Reviews
                </Button>
              </LinkContainer>
            </Col>
          </Row>
          {recentReviews.length > 0 ? (
            <Row>
              {recentReviews.map((review, index) => (
                <Col
                  lg={4}
                  md={6}
                  key={review.id || `review-${index}`}
                  className="mb-4"
                >
                  <ReviewCard review={review} />
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info" className="text-center">
              <div>
                <p>No reviews yet. Be the first to share your thoughts!</p>
                {currentUser ? (
                  <LinkContainer to="/reviews">
                    <Button variant="primary" size="sm">
                      Write a Review
                    </Button>
                  </LinkContainer>
                ) : (
                  <LinkContainer to="/signup">
                    <Button variant="primary" size="sm">
                      Join to Review
                    </Button>
                  </LinkContainer>
                )}
              </div>
            </Alert>
          )}
        </Container>
      </section>

      {/* Popular Movies Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="mb-4">
            <Col>
              <h2 className="fw-bold">Popular Movies</h2>
              <p className="text-muted">Trending movies from our collection</p>
            </Col>
            <Col xs="auto">
              <LinkContainer to="/movies">
                <Button variant="outline-primary" size="sm">
                  Explore More
                </Button>
              </LinkContainer>
            </Col>
          </Row>
          {popularMovies.length > 0 ? (
            <Row>
              {popularMovies.map((movie, index) => (
                <Col
                  lg={2}
                  md={4}
                  sm={6}
                  key={movie.imdbID || `movie-${index}`}
                  className="mb-4"
                >
                  <MovieCard movie={movie} />
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info" className="text-center">
              <div>
                <p>No movies available at the moment.</p>
                <LinkContainer to="/movies">
                  <Button variant="primary" size="sm">
                    Browse Movies
                  </Button>
                </LinkContainer>
              </div>
            </Alert>
          )}
        </Container>
      </section>

      {/* Featured Restaurants Section */}
      <section className="py-5">
        <Container>
          <Row className="mb-4">
            <Col>
              <h2 className="fw-bold">Featured Restaurants</h2>
              <p className="text-muted">Discover great dining spots</p>
            </Col>
            <Col xs="auto">
              <LinkContainer to="/restaurants">
                <Button variant="outline-success" size="sm">
                  View All Restaurants
                </Button>
              </LinkContainer>
            </Col>
          </Row>
          {featuredRestaurants.length > 0 ? (
            <Row>
              {featuredRestaurants.map((restaurant, index) => (
                <Col
                  lg={4}
                  md={6}
                  key={restaurant.id || `restaurant-${index}`}
                  className="mb-4"
                >
                  <RestaurantCard restaurant={restaurant} />
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info" className="text-center">
              <div>
                <p>No restaurants available at the moment.</p>
                <LinkContainer to="/restaurants">
                  <Button variant="success" size="sm">
                    Browse Restaurants
                  </Button>
                </LinkContainer>
              </div>
            </Alert>
          )}
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-dark text-light text-center">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <h2 className="fw-bold mb-3">Ready to Join Our Community?</h2>
              <p className="lead mb-4">
                Share your experiences, discover new favorites, and connect with
                other reviewers.
              </p>
              {currentUser ? (
                <div>
                  <LinkContainer to="/movies">
                    <Button variant="warning" size="lg" className="me-3">
                      🎬 Review Movies
                    </Button>
                  </LinkContainer>
                  <LinkContainer to="/restaurants">
                    <Button variant="info" size="lg">
                      🍽️ Review Restaurants
                    </Button>
                  </LinkContainer>
                </div>
              ) : (
                <div>
                  <LinkContainer to="/signup">
                    <Button variant="warning" size="lg" className="me-3">
                      Sign Up Free
                    </Button>
                  </LinkContainer>
                  <LinkContainer to="/login">
                    <Button variant="outline-light" size="lg">
                      Login
                    </Button>
                  </LinkContainer>
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
