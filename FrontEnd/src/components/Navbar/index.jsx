// Navbar Component
// in: Uses React hooks (useState, useEffect), React Router hooks (useNavigate, useLocation),
//      and js-cookie to manage user authentication state.
// out: Renders the navigation bar with a logo, a hamburger menu for mobile devices,
//      and conditional navigation links based on whether a user is logged in or not.
// Additional: This component listens to route changes to update the user state from cookies,
//      and provides logout functionality that clears the user cookie and redirects to the home page.

// Navbar Component
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Nav,
  LogoContainer,
  NavMenu,
  NavLink,
  NavBtn,
  NavBtnLink,
  Hamburger,
  Bar
} from './NavbarElements';
import { CardsContext } from '../../CardsContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { userInfo, logout } = useContext(CardsContext);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();       // clears cookie and context
    navigate('/');  // redirect to home
  };

  return (
    <Nav>
      <LogoContainer to="/" onClick={closeMenu}>
        <img
          src={require('../../assets/gc_logo_final.png')}
          alt="Garbage Collector"
        />
      </LogoContainer>

      <Hamburger onClick={toggleMenu}>
        <Bar isOpen={isOpen} />
        <Bar isOpen={isOpen} />
        <Bar isOpen={isOpen} />
      </Hamburger>

      <NavMenu isOpen={isOpen}>
        {userInfo ? (
          <>
            <span style={{ color: '#ffd700', marginLeft: '20px', fontWeight: 'bold' }}>
              Welcome, {userInfo.firstName}!
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
