// src/pages/MyReviews.js
import { useEffect, useState, useRef } from "react";
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
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { healthCheck, reviewAPI } from "../services/api";

const MyReviews = () => {
  const { currentUser } = useAuth();
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState("checking");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Add ref to track if data has been loaded
  const hasLoadedRef = useRef(false);

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    type: "movie",
    itemId: "",
    itemTitle: "",
    content: "",
    rating: 5,
  });

  // Check backend status
  const checkBackendStatus = async () => {
    try {
      await healthCheck();
      setBackendStatus("online");
      return true;
    } catch (err) {
      setBackendStatus("offline");
      return false;
    }
  };

  const loadUserReviews = async () => {
    if (!currentUser) return;

    setLoading(true);
    setError("");

    try {
      console.log("🔄 Loading reviews for user:", currentUser.uid);

      // First check if backend is responsive
      const isBackendOnline = await checkBackendStatus();
      if (!isBackendOnline) {
        setError(
          "Backend server is not running. Please start your backend server on port 5000."
        );
        setLoading(false);
        return;
      }

      const reviewsData = await reviewAPI.getByUser(currentUser.uid);
      console.log("✅ Reviews loaded:", reviewsData);

      setUserReviews(Array.isArray(reviewsData) ? reviewsData : []);

      if (reviewsData.length === 0) {
        console.log(
          "ℹ️ No reviews found for user - this is normal for new users"
        );
      }
    } catch (err) {
      console.error("❌ Reviews load error:", err);
      setError("Failed to load your reviews. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await reviewAPI.delete(reviewId);
      setUserReviews(userReviews.filter((review) => review.id !== reviewId));
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Delete review error:", err);
      setError("Failed to delete review. Please try again.");
    }
  };

  const handleEditReview = (reviewId) => {
    alert("Edit functionality will be implemented soon!");
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setError("Please log in to create a review.");
      return;
    }

    // Validation
    if (
      !reviewForm.itemId.trim() ||
      !reviewForm.itemTitle.trim() ||
      !reviewForm.content.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const reviewData = {
        type: reviewForm.type,
        itemId: reviewForm.itemId.trim(),
        itemTitle: reviewForm.itemTitle.trim(),
        content: reviewForm.content.trim(),
        rating: parseInt(reviewForm.rating),
        author: currentUser.displayName || currentUser.email,
        authorId: currentUser.uid,
      };

      console.log("📝 Creating review:", reviewData);

      await reviewAPI.create(reviewData);

      // Reset form and close modal
      setReviewForm({
        type: "movie",
        itemId: "",
        itemTitle: "",
        content: "",
        rating: 5,
      });
      setShowReviewModal(false);

      // Reload reviews
      await loadUserReviews();
    } catch (err) {
      console.error("Create review error:", err);
      setError("Failed to create review: " + (err.userMessage || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openReviewModal = () => {
    setReviewForm({
      type: "movie",
      itemId: "",
      itemTitle: "",
      content: "",
      rating: 5,
    });
    setError("");
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setError("");
  };

  useEffect(() => {
    if (currentUser && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadUserReviews();
    }
  }, [currentUser]);

  const ReviewCard = ({ review, onEdit, onDelete }) => (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <Badge
              bg={review.type === "movie" ? "primary" : "success"}
              className="me-2"
            >
              {review.type === "movie" ? "🎥 Movie" : "🍽️ Restaurant"}
            </Badge>
            <strong>{review.itemTitle}</strong>
            {review.itemId && (
              <small className="text-muted ms-2">(ID: {review.itemId})</small>
            )}
          </div>
          <Badge bg="warning" text="dark">
            ⭐ {review.rating}/5
          </Badge>
        </div>

        <Card.Text>{review.content}</Card.Text>

        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Reviewed on {new Date(review.createdAt).toLocaleDateString()}
            {review.updatedAt && review.updatedAt !== review.createdAt && (
              <>
                {" "}
                • Updated on {new Date(review.updatedAt).toLocaleDateString()}
              </>
            )}
          </small>
          <div>
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2"
              onClick={() => onEdit(review.id)}
            >
              Edit
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onDelete(review.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  // Review Form Modal
  const ReviewFormModal = () => (
    <Modal show={showReviewModal} onHide={closeReviewModal} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>✍️ Write a New Review</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleCreateReview}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Review Type *</Form.Label>
                <Form.Select
                  name="type"
                  value={reviewForm.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="movie">🎥 Movie Review</option>
                  <option value="restaurant">🍽️ Restaurant Review</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Rating *</Form.Label>
                <div>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() =>
                        setReviewForm((prev) => ({ ...prev, rating: star }))
                      }
                      style={{
                        cursor: "pointer",
                        fontSize: "2rem",
                        marginRight: "5px",
                        opacity: star <= reviewForm.rating ? 1 : 0.3,
                      }}
                    >
                      ⭐
                    </span>
                  ))}
                  <span className="ms-2">({reviewForm.rating}/5)</span>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>
              {reviewForm.type === "movie" ? "Movie" : "Restaurant"} ID *
            </Form.Label>
            <Form.Control
              type="text"
              name="itemId"
              value={reviewForm.itemId}
              onChange={handleInputChange}
              placeholder={
                reviewForm.type === "movie"
                  ? "e.g., tt0848228 (IMDb ID)"
                  : "e.g., restaurant-123"
              }
              required
            />
            <Form.Text className="text-muted">
              {reviewForm.type === "movie"
                ? "Enter the IMDb ID or a unique identifier for the movie"
                : "Enter a unique identifier for the restaurant"}
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              {reviewForm.type === "movie" ? "Movie" : "Restaurant"} Title *
            </Form.Label>
            <Form.Control
              type="text"
              name="itemTitle"
              value={reviewForm.itemTitle}
              onChange={handleInputChange}
              placeholder={
                reviewForm.type === "movie"
                  ? "e.g., The Avengers"
                  : "e.g., Joe's Pizza Place"
              }
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Your Review *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="content"
              value={reviewForm.content}
              onChange={handleInputChange}
              placeholder="Share your thoughts and experience..."
              required
            />
            <Form.Text className="text-muted">
              Write a detailed review about your experience
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeReviewModal}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Creating...
              </>
            ) : (
              "Create Review"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );

  if (!currentUser) {
    return (
      <Container className="my-5">
        <Row>
          <Col md={6} className="mx-auto">
            <Alert variant="warning" className="text-center">
              <h4>Authentication Required</h4>
              <p>Please log in to view and manage your reviews.</p>
              <LinkContainer to="/login">
                <Button variant="primary">Login</Button>
              </LinkContainer>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>⭐ My Reviews</h1>
              <p className="text-muted mb-0">
                Manage your movie and restaurant reviews
              </p>
              <small className="text-muted">
                Backend status:
                <Badge
                  bg={backendStatus === "online" ? "success" : "danger"}
                  className="ms-2"
                >
                  {backendStatus}
                </Badge>
              </small>
            </div>
            <div>
              <Button
                variant="primary"
                onClick={openReviewModal}
                disabled={loading}
                className="me-2"
              >
                ✍️ Write Review
              </Button>
              <Button
                variant="outline-primary"
                onClick={loadUserReviews}
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
          </div>

          {error && !showReviewModal && (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading your reviews...</span>
              </Spinner>
              <p className="mt-2">Loading your reviews...</p>
            </div>
          ) : (
            <div>
              {userReviews.length > 0 ? (
                <div>
                  <Alert variant="info" className="mb-4">
                    You have written {userReviews.length} review
                    {userReviews.length !== 1 ? "s" : ""}
                  </Alert>

                  {userReviews.map((review) => (
                    <ReviewCard
                      key={review.id || review._id}
                      review={review}
                      onEdit={handleEditReview}
                      onDelete={handleDeleteReview}
                    />
                  ))}
                </div>
              ) : (
                <Alert variant="info" className="text-center">
                  <h5>No reviews yet!</h5>
                  <p>Start sharing your thoughts with the community.</p>
                  <div className="mt-3">
                    <Button
                      variant="primary"
                      className="me-2"
                      onClick={openReviewModal}
                    >
                      ✍️ Write Your First Review
                    </Button>
                    <LinkContainer to="/movies">
                      <Button variant="outline-primary" className="me-2">
                        Browse Movies
                      </Button>
                    </LinkContainer>
                    <LinkContainer to="/restaurants">
                      <Button variant="outline-success">
                        Browse Restaurants
                      </Button>
                    </LinkContainer>
                  </div>
                </Alert>
              )}
            </div>
          )}
        </Col>
      </Row>

      {/* Review Form Modal */}
      <ReviewFormModal />
    </Container>
  );
};

export default MyReviews;
