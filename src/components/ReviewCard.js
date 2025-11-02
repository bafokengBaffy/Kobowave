import React from 'react';
import './ReviewCard.css';

const ReviewCard = ({ review }) => {
  // Safe destructuring with defaults to prevent undefined errors
  const { 
    title = 'No Title', 
    content = 'No content available', 
    rating = 0, 
    author = 'Anonymous',
    userName = 'Anonymous',
    comments = [],
    tags = [],
    createdAt = new Date(),
    id = Math.random()
  } = review || {};

  // Format date safely
  const reviewDate = new Date(createdAt).toLocaleDateString();

  return (
    <div className=\"review-card\">
      <div className=\"review-header\">
        <h3 className=\"review-title\">{title}</h3>
        <div className=\"review-rating\">
          {'?'.repeat(Math.floor(rating))}{'?'.repeat(5 - Math.floor(rating))} ({rating}/5)
        </div>
      </div>
      
      <p className=\"review-content\">{content}</p>
      
      <div className=\"review-meta\">
        <span className=\"review-author\">By: {userName || author}</span>
        <span className=\"review-date\">on {reviewDate}</span>
      </div>

      {/* Tags section */}
      {tags && tags.length > 0 && (
        <div className=\"review-tags\">
          {tags.map((tag, index) => (
            <span key={index} className=\"tag\">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Comments section */}
      <div className=\"review-comments\">
        <h4>Comments ({comments ? comments.length : 0})</h4>
        {comments && comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className=\"comment\">
              <strong>{comment.userName || comment.author || 'Anonymous'}:</strong> 
              {comment.text || comment.content || 'No comment text'}
            </div>
          ))
        ) : (
          <p>No comments yet</p>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
