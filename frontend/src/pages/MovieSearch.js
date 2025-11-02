// src/pages/MovieSearch.js
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
  Tab,
  Tabs,
} from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { movieAPI, reviewAPI } from "../services/api";

const MovieSearch = () => {
  const [movies, setMovies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [newReview, setNewReview] = useState({
    content: "",
    rating: 5,
  });
  const { currentUser } = useAuth();

  // Add ref to track if data has been loaded
  const hasLoadedRef = useRef(false);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setError("Please enter a search term");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("🔍 Searching for movies:", query);
      const moviesData = await movieAPI.search(query);
      console.log("🎬 Search results:", moviesData);
      setMovies(Array.isArray(moviesData) ? moviesData : []);

      if (moviesData.length === 0) {
        setError("No movies found. Try a different search term.");
      }
    } catch (err) {
      setError("Failed to search movies. Please try again.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (movie) => {
    setSelectedMovie(movie);
    setShowModal(true);
    setActiveTab("details");
    setMovieDetails(null);

    // Load detailed movie information
    if (movie.imdbID) {
      try {
        console.log("📖 Loading details for movie:", movie.imdbID);
        const details = await movieAPI.getDetails(movie.imdbID);
        console.log("🎬 Movie details loaded:", details);
        setMovieDetails(details);
      } catch (err) {
        console.error("Error loading movie details:", err);
        setMovieDetails(movie); // Fallback to basic movie data
      }

      // Load reviews for this movie
      setReviewsLoading(true);
      try {
        const reviewsData = await reviewAPI.getByItem(movie.imdbID, "movie");
        console.log("📝 Movie reviews loaded:", reviewsData);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (err) {
        console.error("Error loading reviews:", err);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Please log in to submit a review.");
      return;
    }

    if (!newReview.content.trim()) {
      setError("Please write a review.");
      return;
    }

    try {
      const reviewData = {
        type: "movie",
        itemId: selectedMovie.imdbID,
        itemTitle: selectedMovie.Title,
        content: newReview.content,
        rating: newReview.rating,
        author: currentUser.displayName || currentUser.email,
        authorId: currentUser.uid,
      };

      console.log("📝 Submitting review:", reviewData);
      await reviewAPI.create(reviewData);

      // Refresh reviews
      const reviewsData = await reviewAPI.getByItem(
        selectedMovie.imdbID,
        "movie"
      );
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);

      setNewReview({ content: "", rating: 5 });
      setError("");
      setActiveTab("reviews");

      // Show success message
      setError("✅ Review submitted successfully!");
      setTimeout(() => setError(""), 3000);
    } catch (err) {
      setError("Failed to submit review. Please try again.");
    }
  };

  const loadPopularMovies = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("🎬 Loading popular movies...");
      const moviesData = await movieAPI.getPopular();
      console.log("🎬 Popular movies loaded:", moviesData);
      setMovies(Array.isArray(moviesData) ? moviesData : []);

      if (moviesData.length === 0) {
        setError("No popular movies found.");
      }
    } catch (err) {
      setError("Failed to load popular movies. Please try again.");
      console.error("Popular movies error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prevent duplicate calls in development
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadPopularMovies();
    }
  }, []);

  // Movie Card Component
  const MovieCard = ({ movie, onViewDetails }) => {
    if (!movie) return null;

    const movieData = {
      id: movie.imdbID || movie.id || `movie-${Math.random()}`,
      title: movie.Title || movie.title || "Unknown Title",
      year: movie.Year || movie.year || "N/A",
      poster:
        movie.Poster && movie.Poster !== "N/A"
          ? movie.Poster
          : "/placeholder-movie.jpg",
      type: movie.Type || "movie",
    };

    return (
      <Card className="h-100 shadow-sm movie-card hover-shadow">
        <Card.Img
          variant="top"
          src={movieData.poster}
          alt={movieData.title}
          style={{ height: "300px", objectFit: "cover" }}
          onError={(e) => {
            e.target.src = "/placeholder-movie.jpg";
          }}
        />
        <Card.Body className="d-flex flex-column">
          <Card.Title
            className="flex-grow-1"
            style={{ fontSize: "1rem", minHeight: "50px" }}
          >
            {movieData.title}
          </Card.Title>
          <Card.Text className="text-muted" style={{ fontSize: "0.9rem" }}>
            {movieData.year} • {movieData.type}
          </Card.Text>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onViewDetails(movie)}
            className="mt-auto"
          >
            View Details
          </Button>
        </Card.Body>
      </Card>
    );
  };

  // Review Card Component
  const ReviewCard = ({ review }) => (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <strong className="text-primary">{review.author}</strong>
          <Badge bg="warning" text="dark">
            ⭐ {review.rating}/5
          </Badge>
        </div>
        <Card.Text className="mb-2">{review.content}</Card.Text>
        <small className="text-muted">
          {new Date(review.createdAt).toLocaleDateString()}
        </small>
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
      <Form onSubmit={handleSubmit} className="mb-4">
        <Row className="g-2 align-items-center">
          <Col>
            <Form.Control
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              size="lg"
            />
          </Col>
          <Col xs="auto">
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !query.trim()}
              size="lg"
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
                "🔍 Search"
              )}
            </Button>
          </Col>
        </Row>
      </Form>
    );
  };

  // Movie Details Component
  const MovieDetails = ({ movie, details }) => {
    const displayDetails = details || movie;

    if (!displayDetails)
      return <Alert variant="warning">No movie details available.</Alert>;

    return (
      <Row>
        <Col md={4}>
          <img
            src={
              displayDetails.Poster && displayDetails.Poster !== "N/A"
                ? displayDetails.Poster
                : "/placeholder-movie.jpg"
            }
            alt={displayDetails.Title}
            className="img-fluid rounded shadow"
            style={{ maxHeight: "400px", objectFit: "cover" }}
            onError={(e) => {
              e.target.src = "/placeholder-movie.jpg";
            }}
          />
        </Col>
        <Col md={8}>
          <div className="mb-3">
            <Badge bg="primary" className="me-2">
              {displayDetails.Year}
            </Badge>
            <Badge bg="success" className="me-2">
              ⭐{" "}
              {displayDetails.imdbRating || displayDetails.imdbRating || "N/A"}
            </Badge>
            <Badge bg="info" className="me-2">
              {displayDetails.Rated || "Not Rated"}
            </Badge>
            <Badge bg="secondary">{displayDetails.Type || "Movie"}</Badge>
          </div>

          <h5>Overview</h5>
          <p className="mb-4 text-muted">
            {displayDetails.Plot || "No overview available."}
          </p>

          {displayDetails.Genre && displayDetails.Genre !== "N/A" && (
            <div className="mb-3">
              <strong>Genres:</strong> {displayDetails.Genre}
            </div>
          )}

          {displayDetails.Runtime && displayDetails.Runtime !== "N/A" && (
            <div className="mb-3">
              <strong>Runtime:</strong> {displayDetails.Runtime}
            </div>
          )}

          {displayDetails.Director && displayDetails.Director !== "N/A" && (
            <div className="mb-3">
              <strong>Director:</strong> {displayDetails.Director}
            </div>
          )}

          {displayDetails.Actors && displayDetails.Actors !== "N/A" && (
            <div className="mb-3">
              <strong>Cast:</strong> {displayDetails.Actors}
            </div>
          )}

          {displayDetails.imdbID && (
            <div className="mb-3">
              <strong>IMDb ID:</strong> <code>{displayDetails.imdbID}</code>
            </div>
          )}
        </Col>
      </Row>
    );
  };

  return (
    <Container className="my-4">
      <Row>
        <Col>
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold text-primary">🎬 Movie Search</h1>
            <p className="lead text-muted">
              Discover movies and share your reviews with our community
            </p>
          </div>

          <SearchBar
            onSearch={handleSearch}
            placeholder="Search for movies by title..."
            loading={loading}
          />

          {error && (
            <Alert
              variant={error.includes("✅") ? "success" : "danger"}
              className="text-center"
            >
              {error}
            </Alert>
          )}

          {/* Debug Info */}
          {movies.length > 0 && (
            <Alert variant="info" className="small">
              <strong>🔧 Found {movies.length} movies</strong>
            </Alert>
          )}

          {/* Movies Grid */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="text-primary">Featured Movies</h4>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={loadPopularMovies}
                disabled={loading}
              >
                {loading ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                ) : (
                  "🔄 Refresh"
                )}
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" size="lg" />
                <p className="mt-3 text-muted">Loading movies...</p>
              </div>
            ) : (
              <Row>
                {movies.map((movie, index) => (
                  <Col
                    key={movie.imdbID || `movie-${index}`}
                    lg={3}
                    md={4}
                    sm={6}
                    className="mb-4"
                  >
                    <MovieCard
                      movie={movie}
                      onViewDetails={handleViewDetails}
                    />
                  </Col>
                ))}
              </Row>
            )}

            {!loading && movies.length === 0 && (
              <Alert variant="info" className="text-center py-4">
                <h5>No movies found</h5>
                <p className="mb-3">
                  Try searching for a movie title or click Refresh to load
                  popular movies.
                </p>
                <Button variant="primary" onClick={loadPopularMovies}>
                  Load Popular Movies
                </Button>
              </Alert>
            )}
          </div>
        </Col>
      </Row>

      {/* Movie Details Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">{selectedMovie?.Title}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {selectedMovie && (
            <Tabs
              activeKey={activeTab}
              onSelect={(tab) => setActiveTab(tab)}
              className="mb-3"
            >
              <Tab eventKey="details" title="🎬 Details">
                <MovieDetails movie={selectedMovie} details={movieDetails} />
              </Tab>

              <Tab eventKey="reviews" title={`📝 Reviews (${reviews.length})`}>
                {reviewsLoading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Loading reviews...</p>
                  </div>
                ) : (
                  <>
                    {reviews.length > 0 ? (
                      reviews.map((review, index) => (
                        <ReviewCard
                          key={review.id || `review-${index}`}
                          review={review}
                        />
                      ))
                    ) : (
                      <Alert variant="info" className="text-center">
                        <h6>No reviews yet</h6>
                        <p>Be the first to review this movie!</p>
                      </Alert>
                    )}
                  </>
                )}
              </Tab>

              <Tab eventKey="write" title="⭐ Write Review">
                {currentUser ? (
                  <Form onSubmit={handleSubmitReview}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Your Rating</Form.Label>
                      <div className="d-flex align-items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            onClick={() =>
                              setNewReview({ ...newReview, rating: star })
                            }
                            style={{
                              cursor: "pointer",
                              fontSize: "2rem",
                              marginRight: "5px",
                              transition: "transform 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.transform = "scale(1.2)")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.transform = "scale(1)")
                            }
                          >
                            {star <= newReview.rating ? "⭐" : "☆"}
                          </span>
                        ))}
                        <span className="ms-2 fw-bold">
                          ({newReview.rating}/5)
                        </span>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Your Review</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={newReview.content}
                        onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            content: e.target.value,
                          })
                        }
                        placeholder="Share your thoughts about this movie... What did you like? What could be better?"
                        required
                      />
                    </Form.Group>

                    <div className="d-grid">
                      <Button variant="primary" type="submit" size="lg">
                        Submit Review
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <Alert variant="warning" className="text-center">
                    <h5>Login Required</h5>
                    <p>Please log in to write a review.</p>
                    <div className="d-grid gap-2">
                      <Button variant="primary" href="/login">
                        Go to Login
                      </Button>
                    </div>
                  </Alert>
                )}
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default MovieSearch;
