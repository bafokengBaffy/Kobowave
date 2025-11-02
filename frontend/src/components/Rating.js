import React from "react";

const Rating = ({
  rating,
  onRatingChange,
  size = "1.5rem",
  readonly = false,
}) => {
  const stars = [1, 2, 3, 4, 5];

  const handleClick = (star) => {
    if (!readonly && onRatingChange) {
      onRatingChange(star);
    }
  };

  return (
    <div className="rating-stars">
      {stars.map((star) => (
        <span
          key={star}
          onClick={() => handleClick(star)}
          style={{
            cursor: readonly ? "default" : "pointer",
            fontSize: size,
            marginRight: "2px",
          }}
          className={!readonly ? "rating-star" : ""}
        >
          {star <= rating ? "⭐" : "☆"}
        </span>
      ))}
      {!readonly && <span className="ms-2 text-muted">({rating}/5)</span>}
    </div>
  );
};

export default Rating;
