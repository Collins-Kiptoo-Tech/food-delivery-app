
import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const allSuggestions = [
    "Greek salad",
    "Backed Fish",
    "Fish Curry",
    "Chicken Katsu",
    "Fried Fish",
    "Chicken Marsala",
    "Italian Food",
    "Burgers",
    "Pizza",
    "Sushi",
    "Pasta",
    "Desserts",
    "Coffee",
    "Smoothies",
    "Chinese Food",
    "Mexican Food",
    "Thai Food",
    "Indian Food",
    "Seafood",
    "Steak",
    "ugali Omena",
    "Ugali Eggs",
    "Ugali Fish",
    "Ugali Sukuma",
    "Ugali Cabbage",
    "club sandwich",
    "veggie sandwich",
    "turkey sandwich",
    "chocolate cake",
  ];

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSuggestions([]);
    } else {
      const filtered = allSuggestions.filter((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 12));
    }
  }, [searchTerm]);

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  return (
    <div className="searchbar-section">
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search for food, drinks or categories"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        <button className="search-btn">Search</button>

        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((s, i) => (
              <div
                key={i}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(s)}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
