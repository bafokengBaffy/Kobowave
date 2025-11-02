import React, { useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";

const SearchBar = ({
  onSearch,
  placeholder = "Search...",
  loading = false,
}) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <InputGroup size="lg">
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />
        <Button
          variant="primary"
          type="submit"
          disabled={loading || !query.trim()}
        >
          {loading ? "Searching..." : "🔍 Search"}
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchBar;
