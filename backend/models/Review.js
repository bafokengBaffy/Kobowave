class Review {
  constructor(type, itemId, itemTitle, content, rating, author, authorId) {
    this.type = type;
    this.itemId = itemId;
    this.itemTitle = itemTitle;
    this.content = content;
    this.rating = rating;
    this.author = author;
    this.authorId = authorId;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  validate() {
    const errors = [];

    if (!this.type || (this.type !== "movie" && this.type !== "restaurant")) {
      errors.push('Type must be either "movie" or "restaurant"');
    }

    if (!this.itemId) {
      errors.push("Item ID is required");
    }

    if (!this.itemTitle || this.itemTitle.trim().length === 0) {
      errors.push("Item title is required");
    }

    if (!this.content || this.content.trim().length < 10) {
      errors.push("Content must be at least 10 characters long");
    }

    if (!this.rating || this.rating < 1 || this.rating > 5) {
      errors.push("Rating must be between 1 and 5");
    }

    if (!this.author || this.author.trim().length === 0) {
      errors.push("Author name is required");
    }

    return errors;
  }
}

module.exports = Review;
