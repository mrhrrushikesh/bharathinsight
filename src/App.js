import React from 'react';
import Header from './components/Header';  // Ensure correct import
import './App.css';
import AppRoutes from "./routes";
import Footer from './components/Footer';

function App() {
  return (
        <div className="App">
          <Header />
         <AppRoutes />
          <Footer />
    </div>
);

}

export default App;
