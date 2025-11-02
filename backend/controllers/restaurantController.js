// controllers/restaurantController.js

const mockRestaurants = [
  {
    id: 1,
    name: "Maseru Steakhouse",
    cuisine: "Steakhouse",
    location: "Maseru, Lesotho",
    rating: 4.5,
    priceRange: "$$$",
    image: "/images/restaurant1.jpg",
    description: "Premium steakhouse offering the finest cuts in Maseru.",
  },
  {
    id: 2,
    name: "Thaba-Bosiu Cultural Restaurant",
    cuisine: "Traditional Basotho",
    location: "Thaba-Bosiu, Lesotho",
    rating: 4.8,
    priceRange: "$$",
    image: "/images/restaurant2.jpg",
    description: "Authentic Basotho cuisine with cultural performances.",
  },
  {
    id: 3,
    name: "Maluti Bistro",
    cuisine: "International",
    location: "Leribe, Lesotho",
    rating: 4.2,
    priceRange: "$$",
    image: "/images/restaurant3.jpg",
    description: "Cozy bistro offering international and local dishes.",
  },
];

const getRestaurants = (req, res) => {
  res.json({
    success: true,
    data: mockRestaurants,
    count: mockRestaurants.length,
  });
};

const searchRestaurants = (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.json({
      success: true,
      data: mockRestaurants,
      count: mockRestaurants.length,
    });
  }

  const filteredRestaurants = mockRestaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.location.toLowerCase().includes(query.toLowerCase())
  );

  res.json({
    success: true,
    data: filteredRestaurants,
    count: filteredRestaurants.length,
  });
};

const getRestaurantDetails = (req, res) => {
  const { id } = req.params;
  const restaurant = mockRestaurants.find((r) => r.id === parseInt(id));

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      error: "Restaurant not found",
    });
  }

  res.json({
    success: true,
    data: restaurant,
  });
};

module.exports = {
  getRestaurants,
  searchRestaurants,
  getRestaurantDetails,
};
