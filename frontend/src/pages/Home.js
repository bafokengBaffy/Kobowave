import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Row,
  Spinner,
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
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

  const features = [
    {
      icon: "🎬",
      title: "Movie Reviews",
      description:
        "Discover and review the latest movies from around the world.",
      link: "/movies",
      buttonText: "Explore Movies",
      variant: "primary",
    },
    {
      icon: "🍽️",
      title: "Restaurant Reviews",
      description: "Find and review great restaurants in your area.",
      link: "/restaurants",
      buttonText: "Find Restaurants",
      variant: "success",
    },
    {
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
      try {
        setLoading(true);

        // Fetch data concurrently
        const [
          reviewsResponse,
          moviesResponse,
          restaurantsResponse,
          usersSnapshot,
        ] = await Promise.all([
          reviewAPI.getAll(),
          movieAPI.getPopular(),
          restaurantAPI.getAll(),
          getDocs(collection(db, "users")),
        ]);

        // Process reviews data
        const allReviews = reviewsResponse.data.data || [];
        setRecentReviews(allReviews.slice(0, 3)); // Show 3 most recent reviews

        // Process movies data
        const moviesData = moviesResponse.data.data?.results || [];
        setPopularMovies(moviesData.slice(0, 6)); // Show 6 popular movies

        // Process restaurants data
        const restaurantsData = restaurantsResponse.data.data || [];
        setFeaturedRestaurants(restaurantsData.slice(0, 3)); // Show 3 featured restaurants

        // Calculate stats
        const movieReviews = allReviews.filter(
          (review) => review.type === "movie"
        ).length;
        const restaurantReviews = allReviews.filter(
          (review) => review.type === "restaurant"
        ).length;
        const totalUsers = usersSnapshot.size;

        setStats({
          moviesReviewed: movieReviews,
          restaurantsListed: restaurantsData.length,
          communityReviews: allReviews.length,
          activeUsers: totalUsers,
        });
      } catch (err) {
        console.error("Error fetching home data:", err);
        setError(
          "Failed to load some data. Some features may not be available."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const ReviewCard = ({ review }) => (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex align-items-center mb-2">
          <span className="me-2">{review.type === "movie" ? "🎬" : "🍽️"}</span>
          <small className="text-muted">{review.type}</small>
        </div>
        <Card.Title className="h6">{review.itemTitle}</Card.Title>
        <Card.Text className="small text-muted">
          {review.content.length > 100
            ? `${review.content.substring(0, 100)}...`
            : review.content}
        </Card.Text>
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-warning">{"⭐".repeat(review.rating)}</span>
          <small className="text-muted">by {review.author}</small>
        </div>
      </Card.Body>
    </Card>
  );

  const MovieCard = ({ movie }) => (
    <Card className="h-100">
      <Card.Img
        variant="top"
        src={
          movie.poster_path
            ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
            : "/placeholder-movie.jpg"
        }
        style={{ height: "150px", objectFit: "cover" }}
        onError={(e) => {
          e.target.src = "/placeholder-movie.jpg";
        }}
      />
      <Card.Body>
        <Card.Title className="h6">{movie.title}</Card.Title>
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            {movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : "N/A"}
          </small>
          <small className="text-warning">
            ⭐ {movie.vote_average?.toFixed(1)}
          </small>
        </div>
      </Card.Body>
    </Card>
  );

  const RestaurantCard = ({ restaurant }) => (
    <Card className="h-100">
      <Card.Body>
        <Card.Title className="h6">{restaurant.name}</Card.Title>
        <Card.Text className="small text-muted mb-2">
          {restaurant.cuisine} • {restaurant.priceRange}
        </Card.Text>
        <Card.Text className="small text-muted mb-2">
          📍 {restaurant.location}
        </Card.Text>
        <div className="text-warning">
          {"⭐".repeat(Math.floor(restaurant.rating))}
        </div>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col className="text-center">
            <Spinner animation="border" role="status">
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
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-50">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Welcome to <span className="text-warning">Kobo</span>
                <span className="text-info">Wave</span>
              </h1>
              <p className="lead mb-4">
                Your ultimate destination for movie and restaurant reviews. Join
                our community of {stats.activeUsers}+ users and discover new
                experiences.
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
                  <LinkContainer to="/login">
                    <Button variant="outline-light" size="sm">
                      👤 Join Our Community
                    </Button>
                  </LinkContainer>
                </div>
              )}
            </Col>
            <Col lg={6}>
              <div className="text-center">
                <div className="bg-light rounded p-4 text-dark">
                  <h4>📊 Live Community Stats</h4>
                  <Row className="mt-3">
                    <Col xs={6} className="mb-3">
                      <h5 className="text-primary mb-1">
                        {stats.moviesReviewed}
                      </h5>
                      <small>Movie Reviews</small>
                    </Col>
                    <Col xs={6} className="mb-3">
                      <h5 className="text-success mb-1">
                        {stats.restaurantsListed}
                      </h5>
                      <small>Restaurants</small>
                    </Col>
                    <Col xs={6} className="mb-3">
                      <h5 className="text-info mb-1">
                        {stats.communityReviews}
                      </h5>
                      <small>Total Reviews</small>
                    </Col>
                    <Col xs={6} className="mb-3">
                      <h5 className="text-warning mb-1">{stats.activeUsers}</h5>
                      <small>Active Users</small>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {error && (
        <Container>
          <Alert variant="warning" className="text-center">
            {error}
          </Alert>
        </Container>
      )}

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
            {features.map((feature, index) => (
              <Col md={4} key={index} className="mb-4">
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
                <Col lg={4} md={6} key={index} className="mb-4">
                  <ReviewCard review={review} />
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info" className="text-center">
              No reviews yet. Be the first to share your thoughts!
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
              <p className="text-muted">Trending movies from TMDB</p>
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
              {popularMovies.map((movie) => (
                <Col lg={2} md={4} sm={6} key={movie.id} className="mb-4">
                  <MovieCard movie={movie} />
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info" className="text-center">
              Loading popular movies...
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
              {featuredRestaurants.map((restaurant) => (
                <Col lg={4} md={6} key={restaurant.id} className="mb-4">
                  <RestaurantCard restaurant={restaurant} />
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info" className="text-center">
              Loading featured restaurants...
            </Alert>
          )}
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-dark text-light">
        <Container>
          <Row className="text-center">
            <Col md={3} className="mb-3">
              <h3 className="text-primary fw-bold">{stats.moviesReviewed}+</h3>
              <p className="text-light">Movies Reviewed</p>
            </Col>
            <Col md={3} className="mb-3">
              <h3 className="text-success fw-bold">
                {stats.restaurantsListed}+
              </h3>
              <p className="text-light">Restaurants Listed</p>
            </Col>
            <Col md={3} className="mb-3">
              <h3 className="text-info fw-bold">{stats.communityReviews}+</h3>
              <p className="text-light">Community Reviews</p>
            </Col>
            <Col md={3} className="mb-3">
              <h3 className="text-warning fw-bold">{stats.activeUsers}+</h3>
              <p className="text-light">Active Community Members</p>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
