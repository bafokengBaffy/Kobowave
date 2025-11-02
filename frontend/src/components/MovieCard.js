import React from "react";
import { Card, Button, Badge } from "react-bootstrap";

const MovieCard = ({ movie, onViewDetails }) => {
  const getPosterUrl = (posterPath) => {
    return posterPath
      ? `https://image.tmdb.org/t/p/w500${posterPath}`
      : "/placeholder-movie.jpg";
  };

  return (
    <Card className="h-100 movie-card">
      <Card.Img
        variant="top"
        src={getPosterUrl(movie.poster_path)}
        style={{ height: "300px", objectFit: "cover" }}
        onError={(e) => {
          e.target.src = "/placeholder-movie.jpg";
        }}
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title className="h6">{movie.title}</Card.Title>

        <div className="mb-2">
          <Badge bg="secondary" className="me-1">
            {movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : "N/A"}
          </Badge>
          <Badge bg="info">
            ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
          </Badge>
        </div>

        <Card.Text className="flex-grow-1 small text-muted">
          {movie.overview
            ? movie.overview.length > 100
              ? `${movie.overview.substring(0, 100)}...`
              : movie.overview
            : "No description available."}
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
};

export default MovieCard;
