import React from "react";
import {  Routes, Route } from "react-router-dom"; // Removed BrowserRouter as Router import
import Home from "../src/pages/Home";
import About from "../src/pages/About";
import Dashboard from './admin/components/Dashboard';

const AppRoutes = () => {
  return (
      <Routes> {/*  Using only <Routes> now */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin/Dashboard" element={<Dashboard />} />      
      </Routes>
  );
};

export default AppRoutes;