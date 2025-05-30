import React from 'react';
import Header from './components/Header';  // Ensure correct import
import './App.css';
import AppRoutes from "./routes";
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
        <div className="App">
          <ScrollToTop />
          <Header />
          <AppRoutes />
          <Footer />
    </div>
);

}

export default App;
