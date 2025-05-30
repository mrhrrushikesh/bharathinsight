import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../src/pages/Home";
import About from "../src/pages/About";
import ArticlePage from './pages/ArticlePage';
import SearchBar from './components/SearchBar';
import CategoryPage from './pages/CategoryPage';
import PrivacyPolicy from './pages/privacypolicy';
import TermsAndConditions from './pages/termsofuse';
import CookiePolicy from './pages/cookie';
import ContactUs from './pages/contactus';
import NotFound from './pages/Notfound';

const AppRoutes = () => { 
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/trending" element={<CategoryPage/>} />
      <Route path="/tech" element={<CategoryPage/>} />
      <Route path="/movies" element={<CategoryPage/>} />
      <Route path="/business" element={<CategoryPage />} />
      <Route path="/crypto" element={<CategoryPage/>} />
      <Route path="/health" element={<CategoryPage />} />
      <Route path="/finance" element={<CategoryPage />} />
      <Route path="/world" element={<CategoryPage />} />
      <Route path="/sports" element={<CategoryPage />} />
      <Route path="/politics" element={<CategoryPage/>} />
      <Route path="/career" element={<CategoryPage/>} />
      <Route path="/:category/:slug" element={<ArticlePage />} />
      <Route path="/search" element={<SearchBar />} />
      <Route path="/category/trending" element={<CategoryPage/>} />
      <Route path="/category/tech" element={<CategoryPage />} />
      <Route path="/category/business" element={<CategoryPage />} />
      <Route path="/category/movies" element={<CategoryPage />} />
      <Route path="/category/crypto" element={<CategoryPage />} />
      <Route path="/category/health" element={<CategoryPage />} />
      <Route path="/category/finance" element={<CategoryPage />} />
      <Route path="/category/world" element={<CategoryPage />} />
      <Route path="/category/sports" element={<CategoryPage />} />
      <Route path="/category/politics" element={<CategoryPage />} />
      <Route path="/category/career" element={<CategoryPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-use" element={<TermsAndConditions />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/contact-us" element={<ContactUs />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
