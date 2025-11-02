// src/pages/Reviews.js
import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Button,
  Form,
  Card,
  Badge,
} from "react-bootstrap";
import { reviewAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const { currentUser } = useAuth();

  // Add ref to track if data has been loaded
  const hasLoadedRef = useRef(false);

  const loadReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const params = filter !== "all" ? { type: filter } : {};
      const reviewsData = await reviewAPI.getAll(params);
      console.log("📝 All reviews loaded:", reviewsData);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (err) {
      setError("Failed to load reviews. Make sure backend is running.");
      console.error("Reviews load error:", err);
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
      setReviews(reviews.filter((review) => review.id !== reviewId));
    } catch (err) {
      setError("Failed to delete review.");
      console.error("Delete review error:", err);
    }
  };

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadReviews();
    }
  }, [filter]);

  const ReviewCard = ({ review, onDelete }) => (
    <Card className="mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <strong>{review.author}</strong>
            <Badge
              bg={review.type === "movie" ? "primary" : "success"}
              className="ms-2"
            >
              {review.type === "movie" ? "🎥 Movie" : "🍽️ Restaurant"}
            </Badge>
          </div>
          <div className="d-flex align-items-center">
            <Badge bg="warning" text="dark" className="me-2">
              ⭐ {review.rating}/5
            </Badge>
            {currentUser &&
              (currentUser.uid === review.authorId ||
                currentUser.email === review.author) && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onDelete(review.id)}
                >
                  Delete
                </Button>
              )}
          </div>
        </div>

        <h6 className="text-muted">{review.itemTitle}</h6>
        <Card.Text className="mt-2">{review.content}</Card.Text>

        <small className="text-muted">
          Reviewed on {new Date(review.createdAt).toLocaleDateString()}
          {review.updatedAt &&
            review.updatedAt !== review.createdAt &&
            ` • Updated on ${new Date(review.updatedAt).toLocaleDateString()}`}
        </small>
      </Card.Body>
    </Card>
  );

  const filteredReviews = reviews.filter((review) => {
    if (filter === "all") return true;
    return review.type === filter;
  });

  return (
    <Container className="my-4">
      <Row>
        <Col>
          <h1 className="text-center mb-4">📝 Community Reviews</h1>
          <p className="text-center text-muted mb-4">
            See what our community is saying about movies and restaurants
          </p>

          {/* Filter Controls */}
          <Row className="mb-4">
            <Col md={6}>
              <Form.Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Reviews</option>
                <option value="movie">🎥 Movie Reviews</option>
                <option value="restaurant">🍽️ Restaurant Reviews</option>
              </Form.Select>
            </Col>
            <Col md={6} className="text-end">
              <Button
                variant="primary"
                onClick={loadReviews}
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
                  "Refresh Reviews"
                )}
              </Button>
            </Col>
          </Row>

          {error && (
            <Alert variant="danger" className="text-center">
              {error}
            </Alert>
          )}

          {/* Reviews List */}
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading reviews...</span>
              </Spinner>
              <p className="mt-2">Loading reviews...</p>
            </div>
          ) : (
            <div>
              <div className="mb-3">
                <strong>
                  Showing {filteredReviews.length}{" "}
                  {filter === "all" ? "reviews" : filter + " reviews"}
                </strong>
              </div>

              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <ReviewCard
                    key={review.id || review._id}
                    review={review}
                    onDelete={handleDeleteReview}
                  />
                ))
              ) : (
                <Alert variant="info" className="text-center">
                  <h5>No reviews found</h5>
                  <p>
                    {filter !== "all"
                      ? `No ${filter} reviews found. Try changing the filter or be the first to write a ${filter} review!`
                      : "No reviews yet. Be the first to write a review!"}
                  </p>
                </Alert>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Reviews;
