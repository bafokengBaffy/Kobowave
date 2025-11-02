import React from "react";
import { Card, Badge } from "react-bootstrap";

const ReviewCard = ({ review }) => {
  const getTypeBadge = (type) => {
    return type === "movie" ? "primary" : "success";
  };

  const getTypeIcon = (type) => {
    return type === "movie" ? "🎥" : "🍽️";
  };

  return (
    <Card className="mb-3 review-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="h5">
            {getTypeIcon(review.type)} {review.itemTitle}
          </Card.Title>
          <Badge bg={getTypeBadge(review.type)}>
            {review.type.charAt(0).toUpperCase() + review.type.slice(1)}
          </Badge>
        </div>

        <div className="rating-stars mb-2">
          {"⭐".repeat(review.rating)}
          {"☆".repeat(5 - review.rating)}
          <span className="ms-2 text-muted">({review.rating}/5)</span>
        </div>

        <Card.Text>{review.content}</Card.Text>

        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            By <strong>{review.author}</strong>
          </small>
          <small className="text-muted">
            {new Date(review.createdAt).toLocaleDateString()}
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ReviewCard;
