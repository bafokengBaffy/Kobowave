// src/pages/MovieSearch.js
import { useEffect, useState } from "react";
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
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [newReview, setNewReview] = useState({
    content: "",
    rating: 5,
  });
  const { currentUser } = useAuth();

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setError("Please enter a search term");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const moviesData = await movieAPI.search(query);
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

    // Load reviews for this movie
    if (movie.imdbID) {
      setReviewsLoading(true);
      try {
        const reviewsData = await reviewAPI.getByItem(movie.imdbID, "movie");
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
    } catch (err) {
      setError("Failed to submit review. Please try again.");
    }
  };

  const loadPopularMovies = async () => {
    setLoading(true);
    setError("");
    try {
      const moviesData = await movieAPI.getPopular();
      setMovies(Array.isArray(moviesData) ? moviesData : []);

      if (moviesData.length === 0) {
        setError("No popular movies found.");
      }
    } catch (err) {
      setError("Failed to load popular movies. Make sure backend is running.");
      console.error("Popular movies error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPopularMovies();
  }, []);

  // Movie Card Component
  const MovieCard = ({ movie, onViewDetails }) => (
    <Card className="h-100 shadow-sm">
      <Card.Img
        variant="top"
        src={movie.Poster !== "N/A" ? movie.Poster : "/placeholder-movie.jpg"}
        alt={movie.Title}
        style={{ height: "300px", objectFit: "cover" }}
        onError={(e) => {
          e.target.src = "/placeholder-movie.jpg";
        }}
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title className="flex-grow-1" style={{ fontSize: "1rem" }}>
          {movie.Title}
        </Card.Title>
        <Card.Text className="text-muted" style={{ fontSize: "0.9rem" }}>
          {movie.Year} • {movie.Type}
        </Card.Text>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onViewDetails(movie)}
        >
          View Details
        </Button>
      </Card.Body>
    </Card>
  );

  // Review Card Component
  const ReviewCard = ({ review }) => (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <strong>{review.author}</strong>
          <Badge bg="warning" text="dark">
            ⭐ {review.rating}/5
          </Badge>
        </div>
        <Card.Text>{review.content}</Card.Text>
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
        <Row className="g-2">
          <Col>
            <Form.Control
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
          </Col>
          <Col xs="auto">
            <Button
              type="submit"
              variant="primary"
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
            </Button>
          </Col>
        </Row>
      </Form>
    );
  };

  // Movie Details Component
  const MovieDetails = ({ movie }) => (
    <Row>
      <Col md={4}>
        <img
          src={movie.Poster !== "N/A" ? movie.Poster : "/placeholder-movie.jpg"}
          alt={movie.Title}
          className="img-fluid rounded shadow"
          onError={(e) => {
            e.target.src = "/placeholder-movie.jpg";
          }}
        />
      </Col>
      <Col md={8}>
        <div className="mb-3">
          <Badge bg="primary" className="me-2">
            {movie.Year}
          </Badge>
          <Badge bg="success" className="me-2">
            ⭐ {movie.imdbRating || "N/A"}
          </Badge>
          <Badge bg="secondary">{movie.Type}</Badge>
        </div>

        <h5>Overview</h5>
        <p className="mb-4">{movie.Plot || "No overview available."}</p>

        {movie.Genre && (
          <div className="mb-3">
            <strong>Genres:</strong> {movie.Genre}
          </div>
        )}

        {movie.Runtime && (
          <div className="mb-3">
            <strong>Runtime:</strong> {movie.Runtime}
          </div>
        )}

        {movie.Director && movie.Director !== "N/A" && (
          <div className="mb-3">
            <strong>Director:</strong> {movie.Director}
          </div>
        )}

        {movie.Actors && movie.Actors !== "N/A" && (
          <div className="mb-3">
            <strong>Cast:</strong> {movie.Actors}
          </div>
        )}

        {movie.imdbID && (
          <div className="mb-3">
            <strong>IMDb ID:</strong> {movie.imdbID}
          </div>
        )}
      </Col>
    </Row>
  );

  return (
    <Container className="my-4">
      <Row>
        <Col>
          <h1 className="text-center mb-4">🎬 Movie Search</h1>
          <p className="text-center text-muted mb-4">
            Discover movies and share your reviews with our community
          </p>

          <SearchBar
            onSearch={handleSearch}
            placeholder="Search for movies by title..."
            loading={loading}
          />

          {error && (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          )}

          {/* Movies Grid */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Featured Movies</h4>
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
                  "Refresh"
                )}
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Loading movies...</p>
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
              <Alert variant="info" className="text-center">
                No movies found. Try searching for a movie title or click
                Refresh to load popular movies.
              </Alert>
            )}
          </div>
        </Col>
      </Row>

      {/* Movie Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedMovie?.Title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMovie && (
            <Tabs
              activeKey={activeTab}
              onSelect={(tab) => setActiveTab(tab)}
              className="mb-3"
            >
              <Tab eventKey="details" title="🎬 Details">
                <MovieDetails movie={selectedMovie} />
              </Tab>

              <Tab eventKey="reviews" title={`📝 Reviews (${reviews.length})`}>
                {reviewsLoading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" />
                    <p className="mt-2">Loading reviews...</p>
                  </div>
                ) : (
                  <>
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <ReviewCard
                          key={review.id || review._id}
                          review={review}
                        />
                      ))
                    ) : (
                      <Alert variant="info" className="text-center">
                        No reviews yet. Be the first to review this movie!
                      </Alert>
                    )}
                  </>
                )}
              </Tab>

              <Tab eventKey="write" title="⭐ Write Review">
                {currentUser ? (
                  <Form onSubmit={handleSubmitReview}>
                    <Form.Group className="mb-3">
                      <Form.Label>Your Rating</Form.Label>
                      <div>
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
                            }}
                          >
                            {star <= newReview.rating ? "⭐" : "☆"}
                          </span>
                        ))}
                        <span className="ms-2">({newReview.rating}/5)</span>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Your Review</Form.Label>
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
                        placeholder="Share your thoughts about this movie..."
                        required
                      />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                      Submit Review
                    </Button>
                  </Form>
                ) : (
                  <Alert variant="warning" className="text-center">
                    <h5>Login Required</h5>
                    <p>Please log in to write a review.</p>
                    <Button variant="primary" href="/login">
                      Go to Login
                    </Button>
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
