// App Component
// in: No props are passed to this component.
// out: Sets up the main application structure by providing routing via react-router-dom, global state via CardsProvider,
//      and renders common UI elements (Navbar and Footer) along with all defined routes for different pages.
// Additional: This component wraps the application with a Router and CardsProvider to enable client-side routing and shared state.
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
import { CardsProvider } from './CardsContext'; // Remove CarsProvider import since it's integrated into CardsProvider
import Login from './pages/Login';
import "./App.css";
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    // in: Router component provides client-side routing capabilities.
    // out: Enables navigation between pages without reloading the entire app.
    <Router>
      {/* 
        in: CardsProvider wraps the entire app to supply global state (cards and related functions) to all child components.
        out: Provides context that is accessible by components like Home, NewCardForm, etc.
      */}
      <CardsProvider>
        <Navbar />
        {/* 
          in: Routes component contains Route components that map URL paths to specific page components.
          out: Renders the corresponding page based on the current URL.
        */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/About" element={<About />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/form" element={<NewCardForm />} />
          <Route path="/update" element={<UpdateCardSelection />} />
          <Route path="/edit/:cardSlug" element={<EditCardForm />} />
          <Route path="/feature/:cardSlug" element={<CardPage />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
        <Footer />
      </CardsProvider>
    </Router>
  );
}

export default App;