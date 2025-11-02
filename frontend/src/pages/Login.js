import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Tab,
  Tabs,
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { loginUser, registerUser } from "../services/authService";

const Login = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { currentUser } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    const result = await loginUser(formData.email, formData.password);

    if (result.success) {
      setSuccess("Login successful! Redirecting...");
      // Redirect will be handled by AuthContext
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (
      !formData.email ||
      !formData.password ||
      !formData.displayName ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password should be at least 6 characters");
      setLoading(false);
      return;
    }

    const result = await registerUser(
      formData.email,
      formData.password,
      formData.displayName
    );

    if (result.success) {
      setSuccess("Registration successful! Welcome to KoboWave!");
      setFormData({
        email: "",
        password: "",
        displayName: "",
        confirmPassword: "",
      });
      setActiveTab("login");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  // If user is already logged in, show welcome message
  if (currentUser) {
    return (
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="shadow">
              <Card.Body className="p-4 text-center">
                <h3>Welcome back!</h3>
                <p className="text-muted mb-4">
                  You are already logged in as {currentUser.email}
                </p>
                <LinkContainer to="/">
                  <Button variant="primary" className="me-2">
                    Go to Home
                  </Button>
                </LinkContainer>
                <LinkContainer to="/my-reviews">
                  <Button variant="outline-primary">My Reviews</Button>
                </LinkContainer>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2>Welcome to KoboWave</h2>
                <p className="text-muted">Join our community of reviewers</p>
              </div>

              {error && (
                <Alert variant="danger" className="text-center">
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="text-center">
                  {success}
                </Alert>
              )}

              <Tabs
                activeKey={activeTab}
                onSelect={(tab) => setActiveTab(tab)}
                className="mb-4"
                justify
              >
                <Tab eventKey="login" title="Sign In">
                  <Form onSubmit={handleLogin}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                      />
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? "Signing In..." : "Sign In"}
                    </Button>
                  </Form>
                </Tab>

                <Tab eventKey="register" title="Create Account">
                  <Form onSubmit={handleRegister}>
                    <Form.Group className="mb-3">
                      <Form.Label>Display Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        placeholder="Choose a display name"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Choose a password (min. 6 characters)"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                      />
                    </Form.Group>

                    <Button
                      variant="success"
                      type="submit"
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </Form>
                </Tab>
              </Tabs>

              <div className="text-center">
                <p className="text-muted mb-2">
                  {activeTab === "login"
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </p>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() =>
                    setActiveTab(activeTab === "login" ? "register" : "login")
                  }
                >
                  {activeTab === "login" ? "Create Account" : "Sign In"}
                </Button>
              </div>

              <hr className="my-4" />

              <div className="text-center">
                <small className="text-muted">
                  By creating an account, you can save your reviews and
                  preferences.
                </small>
              </div>
            </Card.Body>
          </Card>

          <div className="text-center mt-4">
            <LinkContainer to="/">
              <Button variant="outline-secondary">← Back to Home</Button>
            </LinkContainer>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
