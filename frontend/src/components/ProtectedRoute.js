import { Col, Container, Row, Spinner } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Checking authentication...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return currentUser ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
