import React, { useState } from "react";
import "./Home.css";
import SearchBar from "../../components/SearchBar/SearchBar";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import Blog from "../../components/Blog/Blog";
import OfferBanner from "../../components/OfferBanner/OfferBanner";

const Home = () => {
  const [category, setCategory] = useState("All");

  return (
    <div className="homepage">
      <SearchBar />
      <OfferBanner />
      <Header />
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} />
      <Blog />
    </div>
  );
};

export default Home;
