const ReviewCard = ({ review }) => {
  // Ultimate safety check
  if (!review || typeof review !== "object") {
    return (
      <div
        style={{
          border: "1px solid #ddd",
          padding: "16px",
          margin: "16px 0",
          borderRadius: "8px",
        }}
      >
        <div>Loading review...</div>
      </div>
    );
  }

  // Use the actual property names from your API response
  const title = review?.itemTitle ?? review?.title ?? "No Title";
  const content = review?.content ?? "No content available";
  const rating = review?.rating ?? 0;
  const author = review?.author ?? review?.userName ?? "Anonymous";
  const type = review?.type ?? "review";

  // Your API might not have comments and tags, so use empty arrays
  const comments = Array.isArray(review?.comments) ? review.comments : [];
  const tags = Array.isArray(review?.tags) ? review.tags : [];

  const commentsLength = comments?.length ?? 0;
  const tagsLength = tags?.length ?? 0;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "16px",
        margin: "16px 0",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.2em" }}>
            {type === "movie" ? "🎬" : "🍽️"}
          </span>
          <h3 style={{ margin: 0, fontSize: "1.1em" }}>{title}</h3>
        </div>
        <div style={{ color: "#ffa500", fontWeight: "bold" }}>
          {"★".repeat(Math.floor(rating))}
          {"☆".repeat(5 - Math.floor(rating))} ({rating}/5)
        </div>
      </div>

      <p style={{ color: "#666", lineHeight: "1.5", marginBottom: "12px" }}>
        {content.length > 150 ? `${content.substring(0, 150)}...` : content}
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.9em",
          color: "#888",
          marginBottom: "12px",
        }}
      >
        <span>By: {author}</span>
        <span style={{ textTransform: "capitalize" }}>{type}</span>
      </div>

      {/* Only show if you have tags in your data */}
      {tagsLength > 0 && (
        <div style={{ marginBottom: "12px" }}>
          {tags.map((tag, index) => (
            <span
              key={index}
              style={{
                display: "inline-block",
                backgroundColor: "#e0e0e0",
                padding: "4px 8px",
                borderRadius: "4px",
                marginRight: "8px",
                fontSize: "0.8em",
                color: "#555",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Only show if you have comments in your data */}
      {commentsLength > 0 && (
        <div style={{ borderTop: "1px solid #eee", paddingTop: "12px" }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "1em", color: "#555" }}>
            Comments ({commentsLength})
          </h4>
          {comments.map((comment, index) => {
            const safeComment = comment || {};
            const commentAuthor =
              safeComment?.userName ?? safeComment?.author ?? "Anonymous";
            const commentText =
              safeComment?.text ?? safeComment?.content ?? "No comment text";

            return (
              <div
                key={index}
                style={{
                  padding: "8px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "4px",
                  marginBottom: "8px",
                  fontSize: "0.9em",
                }}
              >
                <strong>{commentAuthor}:</strong> {commentText}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
