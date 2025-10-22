import React, { useState } from "react";
import "./Home.css";
import SearchBar from "../../components/SearchBar/SearchBar";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import AppDownload from "../../components/AppDownload/AppDownload";
import Blog from "../../components/Blog/Blog";
import OfferBanner from "../../components/OfferBanner/OfferBanner";
import WhyChooseUs from "../../WhyChooseUs/WhyChooseUs";

const Home = () => {
  const [category, setCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <div>
      <SearchBar />
      <OfferBanner />
      <Header />

      <div className="menu-horizontal">
        <ExploreMenu category={category} setCategory={setCategory} />
        <WhyChooseUs />
      </div>

      <FoodDisplay category={category} />
      <AppDownload />
      <Blog />
    </div>
  );
};

export default Home;
