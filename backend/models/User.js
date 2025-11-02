class User {
  constructor(username, email, password) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.isActive = true;
  }

  validate() {
    const errors = [];

    if (!this.username || this.username.trim().length < 3) {
      errors.push("Username must be at least 3 characters long");
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push("Valid email is required");
    }

    if (!this.password || this.password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    return errors;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = User;
