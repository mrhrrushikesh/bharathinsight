import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../src/pages/Home";
import About from "../src/pages/About";
import Dashboard from './admin/components/Dashboard';
import ArticlePage from './pages/ArticlePage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/admin/Dashboard" element={<Dashboard />} />
      <Route path="/:category/:slug" element={<ArticlePage />} />
    </Routes>
  );
};

export default AppRoutes;
