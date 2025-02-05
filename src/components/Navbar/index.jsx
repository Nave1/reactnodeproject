import React, { useState } from 'react';
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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <Nav>
      {/* לוגו */}
      <LogoContainer to="/" onClick={closeMenu}>
        <img
          src={require('../../assets/gc_logo_final.png')}
          alt="Garbage Collector"
        />
      </LogoContainer>

      {/* המבורגר חדש (3 פסים)  */}
      <Hamburger onClick={toggleMenu}>
        <Bar isOpen={isOpen} />
        <Bar isOpen={isOpen} />
        <Bar isOpen={isOpen} />
      </Hamburger>

      {/* תפריט הניווט (NavMenu) שמושפע מ-isOpen */}
      <NavMenu isOpen={isOpen}>
        <NavLink to="/About" onClick={closeMenu} activeStyle>
          About
        </NavLink>
        <NavLink to="/Contact" onClick={closeMenu} activeStyle>
          Contact
        </NavLink>
        <NavLink to="/Register" onClick={closeMenu} activeStyle>
          Sign Up
        </NavLink>
        <NavBtn>
          <NavBtnLink to="/Signin" onClick={closeMenu}>
            Sign in
          </NavBtnLink>
        </NavBtn>
      </NavMenu>
    </Nav>
  );
};

export default Navbar;
