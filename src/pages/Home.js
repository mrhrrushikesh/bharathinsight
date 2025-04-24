import React, { useEffect, useState, useRef } from "react";
import { Link } from 'react-router-dom';
import "../styles/home.css";
import { getPosts, getCategoryBySlug } from "../services/wordpressAPI";

/**
 * Calculates the time elapsed since a given date string and returns a
 * formatted "time ago" string (e.g., "5 minutes ago", "1 day ago").
 */
const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  try {
    const postDate = new Date(dateString);
    if (isNaN(postDate.getTime())) {
      console.error("Invalid date string passed to formatTimeAgo:", dateString);
      return "";
    }
    const now = new Date();
    const secondsPast = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    if (secondsPast < 0) return "just now";
    if (secondsPast < 2) return "1 second ago";
    if (secondsPast < 60) return `${secondsPast} seconds ago`;
    const minutesPast = Math.floor(secondsPast / 60);
    if (minutesPast < 2) return "1 minute ago";
    if (minutesPast < 60) return `${minutesPast} minutes ago`;
    const hoursPast = Math.floor(minutesPast / 60);
    if (hoursPast < 2) return "1 hour ago";
    if (hoursPast < 24) return `${hoursPast} hours ago`;
    const daysPast = Math.floor(hoursPast / 24);
    if (daysPast < 2) return "1 day ago";
    if (daysPast < 7) return `${daysPast} days ago`;
    if (daysPast < 30.44) {
      const weeksPast = Math.floor(daysPast / 7);
      return weeksPast < 2 ? "1 week ago" : `${weeksPast} weeks ago`;
    }
    if (daysPast < 365) {
      const monthsPast = Math.floor(daysPast / 30.44);
      return monthsPast < 2 ? "1 month ago" : `${monthsPast} months ago`;
    }
    const yearsPast = Math.floor(daysPast / 365);
    return yearsPast < 2 ? "1 year ago" : `${yearsPast} years ago`;
  } catch (error) {
    console.error("Error calculating time ago:", error);
    return "";
  }
};

/**
 * Truncates a string to a specified length and appends '...'.
 */
const truncateTitle = (text, limit) => {
  if (!text) return "";
  if (text.length <= limit) return text;
  return text.substring(0, limit) + "...";
};

const Home = () => {
  const POSTS_PER_CATEGORY = 50;
  const postsPerPage = 4;
  const totalPages = (posts) => Math.ceil((posts.length - 2) / postsPerPage);

  // -------------------------------------------------
  // Section: Trending
  // -------------------------------------------------
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState(null);
  const trendingCarouselRef = useRef(null);
  const trendingViewportRef = useRef(null);
  const [trendingCarouselIndex, setTrendingCarouselIndex] = useState(0);

  useEffect(() => {
    async function fetchTrendingPosts() {
      try {
        setTrendingLoading(true);
        setTrendingError(null);
        const category = await getCategoryBySlug("Trending");
        if (!category) throw new Error("Category 'Trending' not found");
        const fetchedPosts = await getPosts({
          _embed: "true",
          per_page: POSTS_PER_CATEGORY,
          categories: category.id,
        });
        const postsWithMedia = fetchedPosts.map((post) => ({
          ...post,
          postDate: post.date_gmt || post.date,
        }));
        setTrendingPosts(postsWithMedia);
      } catch (err) {
        console.error("Failed to fetch trending posts:", err);
        setTrendingError(err);
      } finally {
        setTrendingLoading(false);
      }
    }
    fetchTrendingPosts();
  }, []);

  const trendingTopPosts = trendingPosts.slice(0, 2);
  const trendingCarouselPosts = trendingPosts.slice(2);
  const totalTrendingPages = totalPages(trendingPosts);

  const moveTrendingCarousel = (direction) => {
    let newIndex = trendingCarouselIndex;
    if (direction === "next" && trendingCarouselIndex < totalTrendingPages - 1) newIndex++;
    else if (direction === "prev" && trendingCarouselIndex > 0) newIndex--;
    if (newIndex !== trendingCarouselIndex && trendingViewportRef.current) {
      setTrendingCarouselIndex(newIndex);
      const viewportWidth = trendingViewportRef.current.clientWidth;
      trendingCarouselRef.current.style.transform = `translateX(-${newIndex * viewportWidth}px)`;
    }
  };

  // -------------------------------------------------
  // Section: Tech
  // -------------------------------------------------
  const [techPosts, setTechPosts] = useState([]);
  const [techLoading, setTechLoading] = useState(true);
  const [techError, setTechError] = useState(null);
  const techCarouselRef = useRef(null);
  const techViewportRef = useRef(null);
  const [techCarouselIndex, setTechCarouselIndex] = useState(0);

  useEffect(() => {
    async function fetchTechPosts() {
      try {
        setTechLoading(true);
        setTechError(null);
        const category = await getCategoryBySlug("tech");
        if (!category) throw new Error("Category 'tech' not found");
        const fetchedPosts = await getPosts({
          _embed: "true",
          per_page: POSTS_PER_CATEGORY,
          categories: category.id,
        });
        const postsWithMedia = fetchedPosts.map((post) => ({
          ...post,
          postDate: post.date_gmt || post.date,
        }));
        setTechPosts(postsWithMedia);
      } catch (err) {
        console.error("Failed to fetch tech posts:", err);
        setTechError(err);
      } finally {
        setTechLoading(false);
      }
    }
    fetchTechPosts();
  }, []);

  const techTopPosts = techPosts.slice(0, 2);
  const techCarouselPosts = techPosts.slice(2);
  const totalTechPages = totalPages(techPosts);

  const moveTechCarousel = (direction) => {
    let newIndex = techCarouselIndex;
    if (direction === "next" && techCarouselIndex < totalTechPages - 1) newIndex++;
    else if (direction === "prev" && techCarouselIndex > 0) newIndex--;
    if (newIndex !== techCarouselIndex && techViewportRef.current) {
      setTechCarouselIndex(newIndex);
      const viewportWidth = techViewportRef.current.clientWidth;
      techCarouselRef.current.style.transform = `translateX(-${newIndex * viewportWidth}px)`;
    }
  };

  // -------------------------------------------------
  // Section: Finance
  // -------------------------------------------------
  const [financePosts, setFinancePosts] = useState([]);
  const [financeLoading, setFinanceLoading] = useState(true);
  const [financeError, setFinanceError] = useState(null);
  const financeCarouselRef = useRef(null);
  const financeViewportRef = useRef(null);
  const [financeCarouselIndex, setFinanceCarouselIndex] = useState(0);

  useEffect(() => {
    async function fetchFinancePosts() {
      try {
        setFinanceLoading(true);
        setFinanceError(null);
        const category = await getCategoryBySlug("finance");
        if (!category) throw new Error("Category 'finance' not found");
        const fetchedPosts = await getPosts({
          _embed: "true",
          per_page: POSTS_PER_CATEGORY,
          categories: category.id,
        });
        const postsWithMedia = fetchedPosts.map((post) => ({
          ...post,
          postDate: post.date_gmt || post.date,
        }));
        setFinancePosts(postsWithMedia);
      } catch (err) {
        console.error("Failed to fetch finance posts:", err);
        setFinanceError(err);
      } finally {
        setFinanceLoading(false);
      }
    }
    fetchFinancePosts();
  }, []);

  const financeTopPosts = financePosts.slice(0, 2);
  const financeCarouselPosts = financePosts.slice(2);
  const totalFinancePages = totalPages(financePosts);

  const moveFinanceCarousel = (direction) => {
    let newIndex = financeCarouselIndex;
    if (direction === "next" && financeCarouselIndex < totalFinancePages - 1) newIndex++;
    else if (direction === "prev" && financeCarouselIndex > 0) newIndex--;
    if (newIndex !== financeCarouselIndex && financeViewportRef.current) {
      setFinanceCarouselIndex(newIndex);
      const viewportWidth = financeViewportRef.current.clientWidth;
      financeCarouselRef.current.style.transform = `translateX(-${newIndex * viewportWidth}px)`;
    }
  };

  // -------------------------------------------------
  // Section: Movies
  // -------------------------------------------------
  const [moviesPosts, setMoviesPosts] = useState([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [moviesError, setMoviesError] = useState(null);
  const moviesCarouselRef = useRef(null);
  const moviesViewportRef = useRef(null);
  const [moviesCarouselIndex, setMoviesCarouselIndex] = useState(0);

  useEffect(() => {
    async function fetchMoviesPosts() {
      try {
        setMoviesLoading(true);
        setMoviesError(null);
        const category = await getCategoryBySlug("movies");
        if (!category) throw new Error("Category 'movies' not found");
        const fetchedPosts = await getPosts({
          _embed: "true",
          per_page: POSTS_PER_CATEGORY,
          categories: category.id,
        });
        const postsWithMedia = fetchedPosts.map((post) => ({
          ...post,
          postDate: post.date_gmt || post.date,
        }));
        setMoviesPosts(postsWithMedia);
      } catch (err) {
        console.error("Failed to fetch movies posts:", err);
        setMoviesError(err);
      } finally {
        setMoviesLoading(false);
      }
    }
    fetchMoviesPosts();
  }, []);

  const moviesTopPosts = moviesPosts.slice(0, 2);
  const moviesCarouselPosts = moviesPosts.slice(2);
  const totalMoviesPages = totalPages(moviesPosts);

  const moveMoviesCarousel = (direction) => {
    let newIndex = moviesCarouselIndex;
    if (direction === "next" && moviesCarouselIndex < totalMoviesPages - 1) newIndex++;
    else if (direction === "prev" && moviesCarouselIndex > 0) newIndex--;
    if (newIndex !== moviesCarouselIndex && moviesViewportRef.current) {
      setMoviesCarouselIndex(newIndex);
      const viewportWidth = moviesViewportRef.current.clientWidth;
      moviesCarouselRef.current.style.transform = `translateX(-${newIndex * viewportWidth}px)`;
    }
  };

  // -------------------------------------------------
  // Section: Business
  // -------------------------------------------------
  const [businessPosts, setBusinessPosts] = useState([]);
  const [businessLoading, setBusinessLoading] = useState(true);
  const [businessError, setBusinessError] = useState(null);
  const businessCarouselRef = useRef(null);
  const businessViewportRef = useRef(null);
  const [businessCarouselIndex, setBusinessCarouselIndex] = useState(0);

  useEffect(() => {
    async function fetchBusinessPosts() {
      try {
        setBusinessLoading(true);
        setBusinessError(null);
        const category = await getCategoryBySlug("business");
        if (!category) throw new Error("Category 'business' not found");
        const fetchedPosts = await getPosts({
          _embed: "true",
          per_page: POSTS_PER_CATEGORY,
          categories: category.id,
        });
        const postsWithMedia = fetchedPosts.map((post) => ({
          ...post,
          postDate: post.date_gmt || post.date,
        }));
        setBusinessPosts(postsWithMedia);
      } catch (err) {
        console.error("Failed to fetch business posts:", err);
        setBusinessError(err);
      } finally {
        setBusinessLoading(false);
      }
    }
    fetchBusinessPosts();
  }, []);

  const businessTopPosts = businessPosts.slice(0, 2);
  const businessCarouselPosts = businessPosts.slice(2);
  const totalBusinessPages = totalPages(businessPosts);

  const moveBusinessCarousel = (direction) => {
    let newIndex = businessCarouselIndex;
    if (direction === "next" && businessCarouselIndex < totalBusinessPages - 1) newIndex++;
    else if (direction === "prev" && businessCarouselIndex > 0) newIndex--;
    if (newIndex !== businessCarouselIndex && businessViewportRef.current) {
      setBusinessCarouselIndex(newIndex);
      const viewportWidth = businessViewportRef.current.clientWidth;
      businessCarouselRef.current.style.transform = `translateX(-${newIndex * viewportWidth}px)`;
    }
  };

  // -------------------------------------------------
  // Section: Sports
  // -------------------------------------------------
  const [sportsPosts, setSportsPosts] = useState([]);
  const [sportsLoading, setSportsLoading] = useState(true);
  const [sportsError, setSportsError] = useState(null);
  const sportsCarouselRef = useRef(null);
  const sportsViewportRef = useRef(null);
  const [sportsCarouselIndex, setSportsCarouselIndex] = useState(0);

  useEffect(() => {
    async function fetchSportsPosts() {
      try {
        setSportsLoading(true);
        setSportsError(null);
        const category = await getCategoryBySlug("sports");
        if (!category) throw new Error("Category 'sports' not found");
        const fetchedPosts = await getPosts({
          _embed: "true",
          per_page: POSTS_PER_CATEGORY,
          categories: category.id,
        });
        const postsWithMedia = fetchedPosts.map((post) => ({
          ...post,
          postDate: post.date_gmt || post.date,
        }));
        setSportsPosts(postsWithMedia);
      } catch (err) {
        console.error("Failed to fetch sports posts:", err);
        setSportsError(err);
      } finally {
        setSportsLoading(false);
      }
    }
    fetchSportsPosts();
  }, []);

  const sportsTopPosts = sportsPosts.slice(0, 2);
  const sportsCarouselPosts = sportsPosts.slice(2);
  const totalSportsPages = totalPages(sportsPosts);

  const moveSportsCarousel = (direction) => {
    let newIndex = sportsCarouselIndex;
    if (direction === "next" && sportsCarouselIndex < totalSportsPages - 1) newIndex++;
    else if (direction === "prev" && sportsCarouselIndex > 0) newIndex--;
    if (newIndex !== sportsCarouselIndex && sportsViewportRef.current) {
      setSportsCarouselIndex(newIndex);
      const viewportWidth = sportsViewportRef.current.clientWidth;
      sportsCarouselRef.current.style.transform = `translateX(-${newIndex * viewportWidth}px)`;
    }
  };

  // -------------------------------------------------
  // Section: Health
  // -------------------------------------------------
  const [healthPosts, setHealthPosts] = useState([]);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState(null);
  const healthCarouselRef = useRef(null);
  const healthViewportRef = useRef(null);
  const [healthCarouselIndex, setHealthCarouselIndex] = useState(0);

  useEffect(() => {
    async function fetchHealthPosts() {
      try {
        setHealthLoading(true);
        setHealthError(null);
        const category = await getCategoryBySlug("health");
        if (!category) throw new Error("Category 'health' not found");
        const fetchedPosts = await getPosts({
          _embed: "true",
          per_page: POSTS_PER_CATEGORY,
          categories: category.id,
        });
        const postsWithMedia = fetchedPosts.map((post) => ({
          ...post,
          postDate: post.date_gmt || post.date,
        }));
        setHealthPosts(postsWithMedia);
      } catch (err) {
        console.error("Failed to fetch health posts:", err);
        setHealthError(err);
      } finally {
        setHealthLoading(false);
      }
    }
    fetchHealthPosts();
  }, []);

  const healthTopPosts = healthPosts.slice(0, 2);
  const healthCarouselPosts = healthPosts.slice(2);
  const totalHealthPages = totalPages(healthPosts);

  const moveHealthCarousel = (direction) => {
    let newIndex = healthCarouselIndex;
    if (direction === "next" && healthCarouselIndex < totalHealthPages - 1) newIndex++;
    else if (direction === "prev" && healthCarouselIndex > 0) newIndex--;
    if (newIndex !== healthCarouselIndex && healthViewportRef.current) {
      setHealthCarouselIndex(newIndex);
      const viewportWidth = healthViewportRef.current.clientWidth;
      healthCarouselRef.current.style.transform = `translateX(-${newIndex * viewportWidth}px)`;
    }
  };

  // -------------------------------------------------
  // Section: Jobs
  // -------------------------------------------------
  const [jobsPosts, setJobsPosts] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);
  const jobsCarouselRef = useRef(null);
  const jobsViewportRef = useRef(null);
  const [jobsCarouselIndex, setJobsCarouselIndex] = useState(0);

  useEffect(() => {
    async function fetchJobsPosts() {
      try {
        setJobsLoading(true);
        setJobsError(null);
        const category = await getCategoryBySlug("jobs");
        if (!category) throw new Error("Category 'jobs' not found");
        const fetchedPosts = await getPosts({
          _embed: "true",
          per_page: POSTS_PER_CATEGORY,
          categories: category.id,
        });
        const postsWithMedia = fetchedPosts.map((post) => ({
          ...post,
          postDate: post.date_gmt || post.date,
        }));
        setJobsPosts(postsWithMedia);
      } catch (err) {
        console.error("Failed to fetch jobs posts:", err);
        setJobsError(err);
      } finally {
        setJobsLoading(false);
      }
    }
    fetchJobsPosts();
  }, []);

  const jobsTopPosts = jobsPosts.slice(0, 2);
  const jobsCarouselPosts = jobsPosts.slice(2);
  const totalJobsPages = totalPages(jobsPosts);

  const moveJobsCarousel = (direction) => {
    let newIndex = jobsCarouselIndex;
    if (direction === "next" && jobsCarouselIndex < totalJobsPages - 1) newIndex++;
    else if (direction === "prev" && jobsCarouselIndex > 0) newIndex--;
    if (newIndex !== jobsCarouselIndex && jobsViewportRef.current) {
      setJobsCarouselIndex(newIndex);
      const viewportWidth = jobsViewportRef.current.clientWidth;
      jobsCarouselRef.current.style.transform = `translateX(-${newIndex * viewportWidth}px)`;
    }
  };

  // -------------------------------------------------
  // Section: Politics
  // -------------------------------------------------
  const [politicsPosts, setPoliticsPosts] = useState([]);
  const [politicsLoading, setPoliticsLoading] = useState(true);
  const [politicsError, setPoliticsError] = useState(null);
  const politicsCarouselRef = useRef(null);
  const politicsViewportRef = useRef(null);
  const [politicsCarouselIndex, setPoliticsCarouselIndex] = useState(0);

  useEffect(() => {
    async function fetchPoliticsPosts() {
      try {
        setPoliticsLoading(true);
        setPoliticsError(null);
        const category = await getCategoryBySlug("politics");
        if (!category) throw new Error("Category 'politics' not found");
        const fetchedPosts = await getPosts({
          _embed: "true",
          per_page: POSTS_PER_CATEGORY,
          categories: category.id,
        });
        const postsWithMedia = fetchedPosts.map((post) => ({
          ...post,
          postDate: post.date_gmt || post.date,
        }));
        setPoliticsPosts(postsWithMedia);
      } catch (err) {
        console.error("Failed to fetch politics posts:", err);
        setPoliticsError(err);
      } finally {
        setPoliticsLoading(false);
      }
    }
    fetchPoliticsPosts();
  }, []);

  const politicsTopPosts = politicsPosts.slice(0, 2);
  const politicsCarouselPosts = politicsPosts.slice(2);
  const totalPoliticsPages = totalPages(politicsPosts);

  const movePoliticsCarousel = (direction) => {
    let newIndex = politicsCarouselIndex;
    if (direction === "next" && politicsCarouselIndex < totalPoliticsPages - 1) newIndex++;
    else if (direction === "prev" && politicsCarouselIndex > 0) newIndex--;
    if (newIndex !== politicsCarouselIndex && politicsViewportRef.current) {
      setPoliticsCarouselIndex(newIndex);
      const viewportWidth = politicsViewportRef.current.clientWidth;
      politicsCarouselRef.current.style.transform = `translateX(-${newIndex * viewportWidth}px)`;
    }
  };

  // -------------------------------------------------
  // Section: World
  // -------------------------------------------------
  const [worldPosts, setWorldPosts] = useState([]);
  const [worldLoading, setWorldLoading] = useState(true);
  const [worldError, setWorldError] = useState(null);
  const worldCarouselRef = useRef(null);
  const worldViewportRef = useRef(null);
  const [worldCarouselIndex, setWorldCarouselIndex] = useState(0);

  useEffect(() => {
    async function fetchWorldPosts() {
      try {
        setWorldLoading(true);
        setWorldError(null);
        const category = await getCategoryBySlug("world");
        if (!category) throw new Error("Category 'world' not found");
        const fetchedPosts = await getPosts({
          _embed: "true",
          per_page: POSTS_PER_CATEGORY,
          categories: category.id,
        });
        const postsWithMedia = fetchedPosts.map((post) => ({
          ...post,
          postDate: post.date_gmt || post.date,
        }));
        setWorldPosts(postsWithMedia);
      } catch (err) {
        console.error("Failed to fetch world posts:", err);
        setWorldError(err);
      } finally {
        setWorldLoading(false);
      }
    }
    fetchWorldPosts();
  }, []);

  const worldTopPosts = worldPosts.slice(0, 2);
  const worldCarouselPosts = worldPosts.slice(2);
  const totalWorldPages = totalPages(worldPosts);

  const moveWorldCarousel = (direction) => {
    let newIndex = worldCarouselIndex;
    if (direction === "next" && worldCarouselIndex < totalWorldPages - 1) newIndex++;
    else if (direction === "prev" && worldCarouselIndex > 0) newIndex--;
    if (newIndex !== worldCarouselIndex && worldViewportRef.current) {
      setWorldCarouselIndex(newIndex);
      const viewportWidth = worldViewportRef.current.clientWidth;
      worldCarouselRef.current.style.transform = `translateX(-${newIndex * viewportWidth}px)`;
    }
  };

  // -------------------------------------------------
  // Section: Crypto
  // -------------------------------------------------
  const [cryptoPosts, setCryptoPosts] = useState([]);
  const [cryptoLoading, setCryptoLoading] = useState(true);
  const [cryptoError, setCryptoError] = useState(null);
  const cryptoCarouselRef = useRef(null);
  const cryptoViewportRef = useRef(null);
  const [cryptoCarouselIndex, setCryptoCarouselIndex] = useState(0);

  useEffect(() => {
    async function fetchCryptoPosts() {
      try {
        setCryptoLoading(true);
        setCryptoError(null);
        const category = await getCategoryBySlug("crypto");
        if (!category) throw new Error("Category 'crypto' not found");
        const fetchedPosts = await getPosts({
          _embed: "true",
          per_page: POSTS_PER_CATEGORY,
          categories: category.id,
        });
        const postsWithMedia = fetchedPosts.map((post) => ({
          ...post,
          postDate: post.date_gmt || post.date,
        }));
        setCryptoPosts(postsWithMedia);
      } catch (err) {
        console.error("Failed to fetch crypto posts:", err);
        setCryptoError(err);
      } finally {
        setCryptoLoading(false);
      }
    }
    fetchCryptoPosts();
  }, []);

  const cryptoTopPosts = cryptoPosts.slice(0, 2);
  const cryptoCarouselPosts = cryptoPosts.slice(2);
  const totalCryptoPages = totalPages(cryptoPosts);

  const moveCryptoCarousel = (direction) => {
    let newIndex = cryptoCarouselIndex;
    if (direction === "next" && cryptoCarouselIndex < totalCryptoPages - 1) newIndex++;
    else if (direction === "prev" && cryptoCarouselIndex > 0) newIndex--;
    if (newIndex !== cryptoCarouselIndex && cryptoViewportRef.current) {
      setCryptoCarouselIndex(newIndex);
      const viewportWidth = cryptoViewportRef.current.clientWidth;
      cryptoCarouselRef.current.style.transform = `translateX(-${newIndex * viewportWidth}px)`;
    }
  };

  // -------------------------------------------------
  // Combined Loading & Error Check
  // -------------------------------------------------
  const isLoading =
    trendingLoading ||
    techLoading ||
    financeLoading ||
    moviesLoading ||
    businessLoading ||
    sportsLoading ||
    healthLoading ||
    jobsLoading ||
    politicsLoading ||
    worldLoading ||
    cryptoLoading;

  const isError =
    trendingError ||
    techError ||
    financeError ||
    moviesError ||
    businessError ||
    sportsError ||
    healthError ||
    jobsError ||
    politicsError ||
    worldError ||
    cryptoError;

  if (isLoading) {
    return <div className="loading-message">Loading posts...</div>;
  }

  if (isError) {
    return <div className="error-message">Could not load posts. Please try again later.</div>;
  }

  if (
    trendingPosts.length < 2 &&
    techPosts.length < 2 &&
    financePosts.length < 2 &&
    moviesPosts.length < 2 &&
    businessPosts.length < 2 &&
    sportsPosts.length < 2 &&
    healthPosts.length < 2 &&
    jobsPosts.length < 2 &&
    politicsPosts.length < 2 &&
    worldPosts.length < 2 &&
    cryptoPosts.length < 2
  ) {
    return <div className="loading-message">No posts found.</div>;
  }

  // -------------------------------------------------
  // RENDER
  // -------------------------------------------------
  return (
    <div className="home-container">
      {/* ================= Trending Section ================= */}
      {trendingPosts.length >= 2 && (
        <section className="trending-container">
          <div className="trending-header">
            <h2 className="trending-title">Trending</h2>
            <div className="trending-title-line"></div>
          </div>
          <div className="trending-grid">
            {trendingTopPosts.map((post) => {
              const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
              const title = truncateTitle(post.title.rendered, 80);
              return (
                <div key={post.id} className="trending-grid-item-wrapper">
                  <Link to={`/trending/${post.slug}`} className="trending-item">
                    <div className="post-image-container">
                      {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                      <span className="post-time">{formatTimeAgo(post.postDate)}</span>
                    </div>
                    <div className="title-overlay">
                      <h3 dangerouslySetInnerHTML={{ __html: title }} />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          {trendingCarouselPosts.length > 0 && (
            <section className="carousel-section-container">
              <div className="carousel-viewport" ref={trendingViewportRef}>
                {trendingCarouselIndex > 0 && <div className="carousel-shade carousel-shade-left"></div>}
                {trendingCarouselIndex > 0 && (
                  <button aria-label="Previous trending posts" className="carousel-nav carousel-nav-prev" onClick={() => moveTrendingCarousel("prev")} />
                )}
                {trendingCarouselIndex < totalTrendingPages - 1 && (
                  <button aria-label="Next trending posts" className="carousel-nav carousel-nav-next" onClick={() => moveTrendingCarousel("next")} />
                )}
                {trendingCarouselIndex < totalTrendingPages - 1 && <div className="carousel-shade carousel-shade-right"></div>}
                <div className="posts-carousel" ref={trendingCarouselRef}>
                  {trendingCarouselPosts.map((post) => {
                    const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                    const title = truncateTitle(post.title.rendered, 80);
                    return (
                      <Link to={`/trending/${post.slug}`} key={post.id} className="carousel-post">
                        <div className="post-image-container">
                          {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                        </div>
                        <h3 className="post-title-below" dangerouslySetInnerHTML={{ __html: title }} />
                        <span className="post-time-below">{formatTimeAgo(post.postDate)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </section>
      )}

      {/* ================= Tech Section ================= */}
      {techPosts.length >= 2 && (
        <section className="trending-container tech-container">
          <div className="trending-header">
            <h2 className="trending-title">Tech</h2>
            <div className="trending-title-line"></div>
          </div>
          <div className="trending-grid">
            {techTopPosts.map((post) => {
              const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
              const title = truncateTitle(post.title.rendered, 80);
              return (
                <div key={post.id} className="trending-grid-item-wrapper">
                  <Link to={`/Tech/${post.slug}`} className="trending-item">
                    <div className="post-image-container">
                      {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                      <span className="post-time">{formatTimeAgo(post.postDate)}</span>
                    </div>
                    <div className="title-overlay">
                      <h3 dangerouslySetInnerHTML={{ __html: title }} />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          {techCarouselPosts.length > 0 && (
            <section className="carousel-section-container">
              <div className="carousel-viewport" ref={techViewportRef}>
                {techCarouselIndex > 0 && <div className="carousel-shade carousel-shade-left"></div>}
                {techCarouselIndex > 0 && (
                  <button aria-label="Previous tech posts" className="carousel-nav carousel-nav-prev" onClick={() => moveTechCarousel("prev")} />
                )}
                {techCarouselIndex < totalTechPages - 1 && (
                  <button aria-label="Next tech posts" className="carousel-nav carousel-nav-next" onClick={() => moveTechCarousel("next")} />
                )}
                {techCarouselIndex < totalTechPages - 1 && <div className="carousel-shade carousel-shade-right"></div>}
                <div className="posts-carousel" ref={techCarouselRef}>
                  {techCarouselPosts.map((post) => {
                    const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                    const title = truncateTitle(post.title.rendered, 80);
                    return (
                      <Link to={`/Tech/${post.slug}`} key={post.id} className="carousel-post">
                        <div className="post-image-container">
                          {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                        </div>
                        <h3 className="post-title-below" dangerouslySetInnerHTML={{ __html: title }} />
                        <span className="post-time-below">{formatTimeAgo(post.postDate)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </section>
      )}

      {/* ================= Finance Section ================= */}
      {financePosts.length >= 2 && (
        <section className="trending-container finance-container">
          <div className="trending-header">
            <h2 className="trending-title">Finance</h2>
            <div className="trending-title-line"></div>
          </div>
          <div className="trending-grid">
            {financeTopPosts.map((post) => {
              const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
              const title = truncateTitle(post.title.rendered, 80);
              return (
                <div key={post.id} className="trending-grid-item-wrapper">
                  <Link to={`Finance/${post.slug}`} className="trending-item">
                    <div className="post-image-container">
                      {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                      <span className="post-time">{formatTimeAgo(post.postDate)}</span>
                    </div>
                    <div className="title-overlay">
                      <h3 dangerouslySetInnerHTML={{ __html: title }} />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          {financeCarouselPosts.length > 0 && (
            <section className="carousel-section-container">
              <div className="carousel-viewport" ref={financeViewportRef}>
                {financeCarouselIndex > 0 && <div className="carousel-shade carousel-shade-left"></div>}
                {financeCarouselIndex > 0 && (
                  <button aria-label="Previous finance posts" className="carousel-nav carousel-nav-prev" onClick={() => moveFinanceCarousel("prev")} />
                )}
                {financeCarouselIndex < totalFinancePages - 1 && (
                  <button aria-label="Next finance posts" className="carousel-nav carousel-nav-next" onClick={() => moveFinanceCarousel("next")} />
                )}
                {financeCarouselIndex < totalFinancePages - 1 && <div className="carousel-shade carousel-shade-right"></div>}
                <div className="posts-carousel" ref={financeCarouselRef}>
                  {financeCarouselPosts.map((post) => {
                    const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                    const title = truncateTitle(post.title.rendered, 80);
                    return (
                      <Link to={`Finance/${post.slug}`} key={post.id} className="carousel-post">
                        <div className="post-image-container">
                          {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                        </div>
                        <h3 className="post-title-below" dangerouslySetInnerHTML={{ __html: title }} />
                        <span className="post-time-below">{formatTimeAgo(post.postDate)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </section>
      )}

      {/* ================= Movies Section ================= */}
      {moviesPosts.length >= 2 && (
        <section className="trending-container">
          <div className="trending-header">
            <h2 className="trending-title">Movies</h2>
            <div className="trending-title-line"></div>
          </div>
          <div className="trending-grid">
            {moviesTopPosts.map((post) => {
              const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
              const title = truncateTitle(post.title.rendered, 80);
              return (
                <div key={post.id} className="trending-grid-item-wrapper">
                  <Link to={`Movies/${post.slug}`} className="trending-item">
                    <div className="post-image-container">
                      {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                      <span className="post-time">{formatTimeAgo(post.postDate)}</span>
                    </div>
                    <div className="title-overlay">
                      <h3 dangerouslySetInnerHTML={{ __html: title }} />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          {moviesCarouselPosts.length > 0 && (
            <section className="carousel-section-container">
              <div className="carousel-viewport" ref={moviesViewportRef}>
                {moviesCarouselIndex > 0 && <div className="carousel-shade carousel-shade-left"></div>}
                {moviesCarouselIndex > 0 && (
                  <button aria-label="Previous movies posts" className="carousel-nav carousel-nav-prev" onClick={() => moveMoviesCarousel("prev")} />
                )}
                {moviesCarouselIndex < totalMoviesPages - 1 && (
                  <button aria-label="Next movies posts" className="carousel-nav carousel-nav-next" onClick={() => moveMoviesCarousel("next")} />
                )}
                {moviesCarouselIndex < totalMoviesPages - 1 && <div className="carousel-shade carousel-shade-right"></div>}
                <div className="posts-carousel" ref={moviesCarouselRef}>
                  {moviesCarouselPosts.map((post) => {
                    const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                    const title = truncateTitle(post.title.rendered, 80);
                    return (
                      <Link to={`Movies/${post.slug}`} key={post.id} className="carousel-post">
                        <div className="post-image-container">
                          {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                        </div>
                        <h3 className="post-title-below" dangerouslySetInnerHTML={{ __html: title }} />
                        <span className="post-time-below">{formatTimeAgo(post.postDate)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </section>
      )}

      {/* ================= Business Section ================= */}
      {businessPosts.length >= 2 && (
        <section className="trending-container">
          <div className="trending-header">
            <h2 className="trending-title">Business</h2>
            <div className="trending-title-line"></div>
          </div>
          <div className="trending-grid">
            {businessTopPosts.map((post) => {
              const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
              const title = truncateTitle(post.title.rendered, 80);
              return (
                <div key={post.id} className="trending-grid-item-wrapper">
                  <Link to={`Business/${post.slug}`} className="trending-item">
                    <div className="post-image-container">
                      {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                      <span className="post-time">{formatTimeAgo(post.postDate)}</span>
                    </div>
                    <div className="title-overlay">
                      <h3 dangerouslySetInnerHTML={{ __html: title }} />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          {businessCarouselPosts.length > 0 && (
            <section className="carousel-section-container">
              <div className="carousel-viewport" ref={businessViewportRef}>
                {businessCarouselIndex > 0 && <div className="carousel-shade carousel-shade-left"></div>}
                {businessCarouselIndex > 0 && (
                  <button aria-label="Previous business posts" className="carousel-nav carousel-nav-prev" onClick={() => moveBusinessCarousel("prev")} />
                )}
                {businessCarouselIndex < totalBusinessPages - 1 && (
                  <button aria-label="Next business posts" className="carousel-nav carousel-nav-next" onClick={() => moveBusinessCarousel("next")} />
                )}
                {businessCarouselIndex < totalBusinessPages - 1 && <div className="carousel-shade carousel-shade-right"></div>}
                <div className="posts-carousel" ref={businessCarouselRef}>
                  {businessCarouselPosts.map((post) => {
                    const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                    const title = truncateTitle(post.title.rendered, 80);
                    return (
                      <Link to={`Business/${post.slug}`} key={post.id} className="carousel-post">
                        <div className="post-image-container">
                          {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                        </div>
                        <h3 className="post-title-below" dangerouslySetInnerHTML={{ __html: title }} />
                        <span className="post-time-below">{formatTimeAgo(post.postDate)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </section>
      )}

      {/* ================= Sports Section ================= */}
      {sportsPosts.length >= 2 && (
        <section className="trending-container">
          <div className="trending-header">
            <h2 className="trending-title">Sports</h2>
            <div className="trending-title-line"></div>
          </div>
          <div className="trending-grid">
            {sportsTopPosts.map((post) => {
              const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
              const title = truncateTitle(post.title.rendered, 80);
              return (
                <div key={post.id} className="trending-grid-item-wrapper">
                  <Link to={`Sports/${post.slug}`} className="trending-item">
                    <div className="post-image-container">
                      {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                      <span className="post-time">{formatTimeAgo(post.postDate)}</span>
                    </div>
                    <div className="title-overlay">
                      <h3 dangerouslySetInnerHTML={{ __html: title }} />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          {sportsCarouselPosts.length > 0 && (
            <section className="carousel-section-container">
              <div className="carousel-viewport" ref={sportsViewportRef}>
                {sportsCarouselIndex > 0 && <div className="carousel-shade carousel-shade-left"></div>}
                {sportsCarouselIndex > 0 && (
                  <button aria-label="Previous sports posts" className="carousel-nav carousel-nav-prev" onClick={() => moveSportsCarousel("prev")} />
                )}
                {sportsCarouselIndex < totalSportsPages - 1 && (
                  <button aria-label="Next sports posts" className="carousel-nav carousel-nav-next" onClick={() => moveSportsCarousel("next")} />
                )}
                {sportsCarouselIndex < totalSportsPages - 1 && <div className="carousel-shade carousel-shade-right"></div>}
                <div className="posts-carousel" ref={sportsCarouselRef}>
                  {sportsCarouselPosts.map((post) => {
                    const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                    const title = truncateTitle(post.title.rendered, 80);
                    return (
                      <Link to={`Sports/${post.slug}`} key={post.id} className="carousel-post">
                        <div className="post-image-container">
                          {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                        </div>
                        <h3 className="post-title-below" dangerouslySetInnerHTML={{ __html: title }} />
                        <span className="post-time-below">{formatTimeAgo(post.postDate)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </section>
      )}

      {/* ================= Health Section ================= */}
      {healthPosts.length >= 2 && (
        <section className="trending-container">
          <div className="trending-header">
            <h2 className="trending-title">Health</h2>
            <div className="trending-title-line"></div>
          </div>
          <div className="trending-grid">
            {healthTopPosts.map((post) => {
              const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
              const title = truncateTitle(post.title.rendered, 80);
              return (
                <div key={post.id} className="trending-grid-item-wrapper">
                  <Link to={`Health/${post.slug}`} className="trending-item">
                    <div className="post-image-container">
                      {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                      <span className="post-time">{formatTimeAgo(post.postDate)}</span>
                    </div>
                    <div className="title-overlay">
                      <h3 dangerouslySetInnerHTML={{ __html: title }} />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          {healthCarouselPosts.length > 0 && (
            <section className="carousel-section-container">
              <div className="carousel-viewport" ref={healthViewportRef}>
                {healthCarouselIndex > 0 && <div className="carousel-shade carousel-shade-left"></div>}
                {healthCarouselIndex > 0 && (
                  <button aria-label="Previous health posts" className="carousel-nav carousel-nav-prev" onClick={() => moveHealthCarousel("prev")} />
                )}
                {healthCarouselIndex < totalHealthPages - 1 && (
                  <button aria-label="Next health posts" className="carousel-nav carousel-nav-next" onClick={() => moveHealthCarousel("next")} />
                )}
                {healthCarouselIndex < totalHealthPages - 1 && <div className="carousel-shade carousel-shade-right"></div>}
                <div className="posts-carousel" ref={healthCarouselRef}>
                  {healthCarouselPosts.map((post) => {
                    const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                    const title = truncateTitle(post.title.rendered, 80);
                    return (
                      <Link to={`Health/${post.slug}`} key={post.id} className="carousel-post">
                        <div className="post-image-container">
                          {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                        </div>
                        <h3 className="post-title-below" dangerouslySetInnerHTML={{ __html: title }} />
                        <span className="post-time-below">{formatTimeAgo(post.postDate)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </section>
      )}

      {/* ================= Jobs Section ================= */}
      {jobsPosts.length >= 2 && (
        <section className="trending-container">
          <div className="trending-header">
            <h2 className="trending-title">Jobs</h2>
            <div className="trending-title-line"></div>
          </div>
          <div className="trending-grid">
            {jobsTopPosts.map((post) => {
              const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
              const title = truncateTitle(post.title.rendered, 80);
              return (
                <div key={post.id} className="trending-grid-item-wrapper">
                  <Link to={`Jobs/${post.slug}`} className="trending-item">
                    <div className="post-image-container">
                      {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                      <span className="post-time">{formatTimeAgo(post.postDate)}</span>
                    </div>
                    <div className="title-overlay">
                      <h3 dangerouslySetInnerHTML={{ __html: title }} />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          {jobsCarouselPosts.length > 0 && (
            <section className="carousel-section-container">
              <div className="carousel-viewport" ref={jobsViewportRef}>
                {jobsCarouselIndex > 0 && <div className="carousel-shade carousel-shade-left"></div>}
                {jobsCarouselIndex > 0 && (
                  <button aria-label="Previous jobs posts" className="carousel-nav carousel-nav-prev" onClick={() => moveJobsCarousel("prev")} />
                )}
                {jobsCarouselIndex < totalJobsPages - 1 && (
                  <button aria-label="Next jobs posts" className="carousel-nav carousel-nav-next" onClick={() => moveJobsCarousel("next")} />
                )}
                {jobsCarouselIndex < totalJobsPages - 1 && <div className="carousel-shade carousel-shade-right"></div>}
                <div className="posts-carousel" ref={jobsCarouselRef}>
                  {jobsCarouselPosts.map((post) => {
                    const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                    const title = truncateTitle(post.title.rendered, 80);
                    return (
                      <Link to={`Jobs/${post.slug}`} key={post.id} className="carousel-post">
                        <div className="post-image-container">
                          {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                        </div>
                        <h3 className="post-title-below" dangerouslySetInnerHTML={{ __html: title }} />
                        <span className="post-time-below">{formatTimeAgo(post.postDate)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </section>
      )}

      {/* ================= Politics Section ================= */}
      {politicsPosts.length >= 2 && (
        <section className="trending-container">
          <div className="trending-header">
            <h2 className="trending-title">Politics</h2>
            <div className="trending-title-line"></div>
          </div>
          <div className="trending-grid">
            {politicsTopPosts.map((post) => {
              const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
              const title = truncateTitle(post.title.rendered, 80);
              return (
                <div key={post.id} className="trending-grid-item-wrapper">
                  <Link to={`Politics/${post.slug}`} className="trending-item">
                    <div className="post-image-container">
                      {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                      <span className="post-time">{formatTimeAgo(post.postDate)}</span>
                    </div>
                    <div className="title-overlay">
                      <h3 dangerouslySetInnerHTML={{ __html: title }} />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          {politicsCarouselPosts.length > 0 && (
            <section className="carousel-section-container">
              <div className="carousel-viewport" ref={politicsViewportRef}>
                {politicsCarouselIndex > 0 && <div className="carousel-shade carousel-shade-left"></div>}
                {politicsCarouselIndex > 0 && (
                  <button aria-label="Previous politics posts" className="carousel-nav carousel-nav-prev" onClick={() => movePoliticsCarousel("prev")} />
                )}
                {politicsCarouselIndex < totalPoliticsPages - 1 && (
                  <button aria-label="Next politics posts" className="carousel-nav carousel-nav-next" onClick={() => movePoliticsCarousel("next")} />
                )}
                {politicsCarouselIndex < totalPoliticsPages - 1 && <div className="carousel-shade carousel-shade-right"></div>}
                <div className="posts-carousel" ref={politicsCarouselRef}>
                  {politicsCarouselPosts.map((post) => {
                    const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                    const title = truncateTitle(post.title.rendered, 80);
                    return (
                      <Link to={`Politics/${post.slug}`} key={post.id} className="carousel-post">
                        <div className="post-image-container">
                          {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                        </div>
                        <h3 className="post-title-below" dangerouslySetInnerHTML={{ __html: title }} />
                        <span className="post-time-below">{formatTimeAgo(post.postDate)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </section>
      )}

      {/* ================= World Section ================= */}
      {worldPosts.length >= 2 && (
        <section className="trending-container">
          <div className="trending-header">
            <h2 className="trending-title">World</h2>
            <div className="trending-title-line"></div>
          </div>
          <div className="trending-grid">
            {worldTopPosts.map((post) => {
              const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
              const title = truncateTitle(post.title.rendered, 80);
              return (
                <div key={post.id} className="trending-grid-item-wrapper">
                  <Link to={`World/${post.slug}`} className="trending-item">
                    <div className="post-image-container">
                      {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                      <span className="post-time">{formatTimeAgo(post.postDate)}</span>
                    </div>
                    <div className="title-overlay">
                      <h3 dangerouslySetInnerHTML={{ __html: title }} />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          {worldCarouselPosts.length > 0 && (
            <section className="carousel-section-container">
              <div className="carousel-viewport" ref={worldViewportRef}>
                {worldCarouselIndex > 0 && <div className="carousel-shade carousel-shade-left"></div>}
                {worldCarouselIndex > 0 && (
                  <button aria-label="Previous world posts" className="carousel-nav carousel-nav-prev" onClick={() => moveWorldCarousel("prev")} />
                )}
                {worldCarouselIndex < totalWorldPages - 1 && (
                  <button aria-label="Next world posts" className="carousel-nav carousel-nav-next" onClick={() => moveWorldCarousel("next")} />
                )}
                {worldCarouselIndex < totalWorldPages - 1 && <div className="carousel-shade carousel-shade-right"></div>}
                <div className="posts-carousel" ref={worldCarouselRef}>
                  {worldCarouselPosts.map((post) => {
                    const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                    const title = truncateTitle(post.title.rendered, 80);
                    return (
                      <Link to={`World/${post.slug}`} key={post.id} className="carousel-post">
                        <div className="post-image-container">
                          {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                        </div>
                        <h3 className="post-title-below" dangerouslySetInnerHTML={{ __html: title }} />
                        <span className="post-time-below">{formatTimeAgo(post.postDate)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </section>
      )}

      {/* ================= Crypto Section ================= */}
      {cryptoPosts.length >= 2 && (
        <section className="trending-container">
          <div className="trending-header">
            <h2 className="trending-title">Crypto</h2>
            <div className="trending-title-line"></div>
          </div>
          <div className="trending-grid">
            {cryptoTopPosts.map((post) => {
              const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
              const title = truncateTitle(post.title.rendered, 80);
              return (
                <div key={post.id} className="trending-grid-item-wrapper">
                 <Link to={`Crypto/${post.slug}`} className="trending-item">
                    <div className="post-image-container">
                      {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                      <span className="post-time">{formatTimeAgo(post.postDate)}</span>
                    </div>
                    <div className="title-overlay">
                      <h3 dangerouslySetInnerHTML={{ __html: title }} />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          {cryptoCarouselPosts.length > 0 && (
            <section className="carousel-section-container">
              <div className="carousel-viewport" ref={cryptoViewportRef}>
                {cryptoCarouselIndex > 0 && <div className="carousel-shade carousel-shade-left"></div>}
                {cryptoCarouselIndex > 0 && (
                  <button aria-label="Previous crypto posts" className="carousel-nav carousel-nav-prev" onClick={() => moveCryptoCarousel("prev")} />
                )}
                {cryptoCarouselIndex < totalCryptoPages - 1 && (
                  <button aria-label="Next crypto posts" className="carousel-nav carousel-nav-next" onClick={() => moveCryptoCarousel("next")} />
                )}
                {cryptoCarouselIndex < totalCryptoPages - 1 && <div className="carousel-shade carousel-shade-right"></div>}
                <div className="posts-carousel" ref={cryptoCarouselRef}>
                  {cryptoCarouselPosts.map((post) => {
                    const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                    const title = truncateTitle(post.title.rendered, 80);
                    return (
                      <Link to={`Crypto/${post.slug}`} key={post.id} className="carousel-post">
                        <div className="post-image-container">
                          {imageUrl ? <img src={imageUrl} alt={post.title.rendered} /> : <div className="no-image-placeholder">No Image</div>}
                        </div>
                        <h3 className="post-title-below" dangerouslySetInnerHTML={{ __html: title }} />
                        <span className="post-time-below">{formatTimeAgo(post.postDate)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </section>
      )}
    </div>
  );
};

export default Home;
