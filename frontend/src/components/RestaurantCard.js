import React from "react";
import { Card, Button, Badge } from "react-bootstrap";

const RestaurantCard = ({ restaurant, onViewDetails }) => {
  return (
    <Card className="h-100 restaurant-card">
      <Card.Body className="d-flex flex-column">
        <Card.Title className="h5">{restaurant.name}</Card.Title>

        <div className="mb-2">
          <Badge bg="success" className="me-1">
            {restaurant.cuisine}
          </Badge>
          <Badge bg="warning" text="dark">
            {restaurant.priceRange}
          </Badge>
        </div>

        <Card.Text className="text-muted small mb-2">
          📍 {restaurant.location}
        </Card.Text>

        <div className="rating-stars mb-3">
          {"⭐".repeat(Math.floor(restaurant.rating))}
          {"☆".repeat(5 - Math.floor(restaurant.rating))}
          <span className="ms-2">({restaurant.rating})</span>
        </div>

        <Card.Text className="flex-grow-1 small">
          {restaurant.description ||
            "A great place to dine and enjoy delicious food."}
        </Card.Text>

        <Button
          variant="outline-success"
          size="sm"
          onClick={() => onViewDetails(restaurant)}
        >
          View Details & Reviews
        </Button>
      </Card.Body>
    </Card>
  );
};

export default RestaurantCard;
