/*import React from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";

const SearchBar = () => {
  return (
    <div className="search-bar">
      <FaSearch className="search-icon" />
      <input type="text" placeholder="Search for food, drinks or categories" />
      <button className="search-btn">Search</button>
    </div>
  );
};

export default SearchBar;*/

import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchBar.css";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Sample FOOD items and categories - replace with your actual menu data
  const allSuggestions = [
    "Greek salad",
    "Veg salad",
    "Clover salad",
    "Chicken salad",
    "Lasagna Rolls",
    "Chicken Rolls",
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
    "ugali_omena",
    "cobb salad",
    "caesar salad",
    "fruit salad",
    "tuna salad",
    "chicken sandwich",
    "club sandwich",
    "veggie sandwich",
    "turkey sandwich",
    "chocolate cake",
  ];

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSuggestions([]); // Show NOTHING when empty
    } else {
      const filtered = allSuggestions.filter((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 15)); // Show max 15 filtered results
    }
  }, [searchTerm]);

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    // This should trigger filtering of your FoodDisplay component
    console.log("Searching for:", suggestion);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    // Only show suggestions if there's already text typed
    if (searchTerm.trim() !== "") {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSearch = () => {
    setShowSuggestions(false);
    // Trigger actual search/filter in your food display
    console.log("Searching for:", searchTerm);
  };

  return (
    <div className="search-bar">
      <FaSearch className="search-icon" />
      <input
        type="text"
        placeholder="Search for food, drinks or categories"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      <button className="search-btn" onClick={handleSearch}>
        Search
      </button>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          <div className="suggestions-header">
            <p>SUGGESTED SEARCHES</p>
          </div>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
          <div className="suggestions-footer">
            <p>All results for &quot;{searchTerm}&quot;</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
