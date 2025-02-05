// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar/index";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home";  // Home.jsx
import About from "./pages/About";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import NewCardForm from "./components/NewCardForm/NewCardForm";
import EditCardForm from "./components/EditCardForm/EditCardForm";
import CardPage from "./pages/features/CardPage";
import UpdateCardSelection from "./components/UpdateCardSelection/UpdateCardSelection";
import { CardsProvider } from './CardsContext';
import "./App.css";

function App() {
  return (
    <Router>
      <CardsProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/About" element={<About />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/form" element={<NewCardForm />} />
          <Route path="/update" element={<UpdateCardSelection />} />
          <Route path="/edit/:cardSlug" element={<EditCardForm />} />
          <Route path="/feature/:cardSlug" element={<CardPage />} />
        </Routes>
        <Footer />
      </CardsProvider>
    </Router>
  );
}

export default App;
