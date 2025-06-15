// Navbar Component
// in: Uses React hooks (useState, useEffect), React Router hooks (useNavigate, useLocation),
//      and js-cookie to manage user authentication state.
// out: Renders the navigation bar with a logo, a hamburger menu for mobile devices,
//      and conditional navigation links based on whether a user is logged in or not.
// Additional: This component listens to route changes to update the user state from cookies,
//      and provides logout functionality that clears the user cookie and redirects to the home page.
// src/components/Navbar/index.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import {
  Nav,
  LogoContainer,
  NavMenu,
  NavLink,
  NavBtn,
  NavBtnLink,
  Hamburger,
  Bar,
} from './NavbarElements';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const storedUser = Cookies.get('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user cookie:', error);
      }
    } else {
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    Cookies.remove('user'); // delete cookie

    setUser(null);
    navigate('/login');
  };

  

  return (
    <Nav>
      <LogoContainer to="/" onClick={closeMenu}>
        <img
          src={require('../../assets/gc_logo_final.png')}
          alt="Garbage Collector"
        />
      </LogoContainer>

      {/* Custom animated hamburger menu */}
      <Hamburger onClick={toggleMenu}>
        <Bar isOpen={isOpen} />
        <Bar isOpen={isOpen} />
        <Bar isOpen={isOpen} />
      </Hamburger>

      {/* Optional fallback icon toggle buttons, hidden by default via styled-components */}
      {/* Uncomment below if you want to use icon version instead of Hamburger + Bar */}
      {/* {isOpen ? <Times onClick={toggleMenu} /> : <Bars onClick={toggleMenu} />} */}

      <NavMenu isOpen={isOpen}>

        {user ? (
          <>
            <span style={{ color: '#ffd700', marginLeft: '20px', fontWeight: 'bold' }}>
              Welcome, {user.firstName}!
            </span>
            <NavBtn>
              <NavBtnLink as="button" onClick={handleLogout}>
                Log Out
              </NavBtnLink>
            </NavBtn>
          </>
        ) : (
          <>
            <NavLink to="/Register" onClick={closeMenu}>
              Sign Up
            </NavLink>
            <NavBtn>
              <NavBtnLink to="/Login" onClick={closeMenu}>
                Sign In
              </NavBtnLink>
            </NavBtn>
          </>
        )}
      </NavMenu>
    </Nav>
  );
};

export default Navbar;
