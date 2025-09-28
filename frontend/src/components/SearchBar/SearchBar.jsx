import React from "react";
import { FaSearch } from "react-icons/fa"; // install with: npm install react-icons
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

export default SearchBar;
