// src/components/ReviewCard.js
import { Badge, Button, Card } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { reviewAPI } from "../services/api";

const ReviewCard = ({ review, showActions = false, onDelete }) => {
  const { currentUser } = useAuth();

  if (!review) {
    return (
      <Card className="mb-3">
        <Card.Body>
          <Card.Text className="text-muted">Review not available</Card.Text>
        </Card.Body>
      </Card>
    );
  }

  const handleDelete = async () => {
    if (!review.id) {
      console.error("Cannot delete review: No review ID");
      return;
    }

    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await reviewAPI.delete(review.id);
        if (onDelete) {
          onDelete(review.id);
        }
      } catch (error) {
        console.error("Failed to delete review:", error);
        alert("Failed to delete review. Please try again.");
      }
    }
  };

  const canDelete =
    currentUser &&
    (currentUser.uid === review.authorId ||
      currentUser.email === review.author);

  return (
    <Card className="mb-3 shadow-sm review-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-1">
              <Badge
                bg={review.type === "movie" ? "primary" : "success"}
                className="me-2"
              >
                {review.type === "movie" ? "🎥 Movie" : "🍽️ Restaurant"}
              </Badge>
              <strong className="text-dark">{review.author}</strong>
            </div>
            <h6 className="text-muted mb-0">{review.itemTitle}</h6>
          </div>
          <div className="d-flex align-items-center">
            <Badge bg="warning" text="dark" className="fs-6">
              ⭐ {review.rating}/5
            </Badge>
          </div>
        </div>

        <Card.Text className="mt-3 mb-3" style={{ lineHeight: "1.5" }}>
          {review.content}
        </Card.Text>

        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Reviewed on{" "}
            {new Date(review.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
            {review.updatedAt && review.updatedAt !== review.createdAt && (
              <span className="ms-1">
                • Updated {new Date(review.updatedAt).toLocaleDateString()}
              </span>
            )}
          </small>

          {showActions && canDelete && (
            <Button variant="outline-danger" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ReviewCard;
