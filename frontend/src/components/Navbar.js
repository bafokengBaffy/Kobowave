import { Button, Container, Dropdown, Nav, Navbar } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { logoutUser } from "../services/authService";

const NavigationBar = () => {
  const { currentUser, userData } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand href="/" className="fw-bold">
          🎬 <span className="text-warning">Kobo</span>
          <span className="text-info">Wave</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>Home</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/movies">
              <Nav.Link>🎥 Movies</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/restaurants">
              <Nav.Link>🍽️ Restaurants</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/reviews">
              <Nav.Link>📝 All Reviews</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/about">
              <Nav.Link>ℹ️ About</Nav.Link>
            </LinkContainer>
            {currentUser && (
              <LinkContainer to="/my-reviews">
                <Nav.Link>⭐ My Reviews</Nav.Link>
              </LinkContainer>
            )}
          </Nav>

          <Nav>
            {currentUser ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-light" id="user-dropdown">
                  👤 {userData?.displayName || currentUser.email}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <LinkContainer to="/my-reviews">
                    <Dropdown.Item>⭐ My Reviews</Dropdown.Item>
                  </LinkContainer>
                  <Dropdown.Divider />
                  <Dropdown.ItemText className="small text-muted">
                    Signed in as {currentUser.email}
                  </Dropdown.ItemText>
                  <Dropdown.Item onClick={handleLogout}>
                    🚪 Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <LinkContainer to="/login">
                <Button variant="outline-light" size="sm">
                  Login
                </Button>
              </LinkContainer>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
