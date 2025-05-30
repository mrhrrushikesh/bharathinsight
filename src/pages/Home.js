import React from "react";
import "../styles/home.css";
import CategorySection from "../components/CategorySection";

/**
 * Home page component
 * Implements lazy loading of category sections using the CategorySection component
 * Above-the-fold sections (Trending and Tech) load immediately while others are loaded on demand
 */
const Home = () => {
    return (
    <div className="home-container">
      {/* Above-the-fold sections that load immediately */}
      <CategorySection categorySlug="Trending" categoryTitle="Trending" loadImmediately={true} />
      <CategorySection categorySlug="tech" categoryTitle="Tech" loadImmediately={true} />
      
      {/* Below-the-fold sections that will be lazy loaded */}
      <CategorySection categorySlug="finance" categoryTitle="Finance" />
      <CategorySection categorySlug="movies" categoryTitle="Movies" />
      <CategorySection categorySlug="business" categoryTitle="Business" />
      <CategorySection categorySlug="sports" categoryTitle="Sports" />
      <CategorySection categorySlug="health" categoryTitle="Health" />
      <CategorySection categorySlug="career" categoryTitle="Career" />
      <CategorySection categorySlug="politics" categoryTitle="Politics" />
      <CategorySection categorySlug="world" categoryTitle="World" />
      <CategorySection categorySlug="crypto" categoryTitle="Crypto" />
    </div>
  );
};

export default Home;
