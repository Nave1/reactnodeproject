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
  Bar
} from './NavbarElements';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // get current location

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // useEffect that willl run (location) whenever location is changes (by location the meaning is moving between pages).
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
    navigate('/'); // navigate to home page after logout
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
