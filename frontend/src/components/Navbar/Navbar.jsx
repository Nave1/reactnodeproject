// Navbar Component
// in: Uses React hooks (useState, useEffect), React Router hooks (useNavigate, useLocation),
//      and js-cookie to manage user authentication state.
// out: Renders the navigation bar with a logo, a hamburger menu for mobile devices,
//      and conditional navigation links based on whether a user is logged in or not.
// Additional: This component listens to route changes to update the user state from cookies,
//      and provides logout functionality that clears the user cookie and redirects to the home page.
// src/components/Navbar/index.jsx
import React, { useState, useEffect, useContext } from 'react';
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
  NavLinksGroup,
  NavSeparator
} from './NavbarElements';

// Import the context
import { CardsContext } from '../../contexts/CardsContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the most up-to-date user info (including points) from context
  const { userInfo } = useContext(CardsContext);

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
    Cookies.remove('user');
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

      <NavLinksGroup>
        {/* Admin-only: User Management */}
        {user?.role === 'admin' && (
          <>
            <NavLink to="/user-management" onClick={closeMenu}>
              User Management
            </NavLink>
            <NavSeparator>|</NavSeparator>
          </>
        )}
        {/* Rewards: All logged-in users */}
        {user && (
          <NavLink to="/rewards" onClick={closeMenu}>
            Rewards
          </NavLink>
        )}
      </NavLinksGroup>

      {/* Custom animated hamburger menu */}
      <Hamburger onClick={toggleMenu}>
        <Bar isOpen={isOpen} />
        <Bar isOpen={isOpen} />
        <Bar isOpen={isOpen} />
      </Hamburger>

      <NavMenu isOpen={isOpen}>
        {user ? (
          <>
            <span style={{ color: '#ffd700', marginLeft: '20px', fontWeight: 'bold' }}>
              Welcome, {user.firstName || user.email}!
            </span>
            {/* POINTS DISPLAY - right after welcome */}
            {userInfo && userInfo.role !== 'admin' && (
              <span style={{
                color: '#ffd700',
                marginLeft: '16px',
                fontWeight: 'bold',
                fontSize: '1.05rem',
                letterSpacing: '0.5px',
              }}>
                | Points: {userInfo.points ?? 0}
              </span>
            )}
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
