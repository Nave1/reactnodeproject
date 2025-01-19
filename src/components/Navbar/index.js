import React from 'react';
import {Nav, NavLink, Bars, NavMenu, NavBtn, NavBtnLink} from "./NavbarElements";

const Navbar = () => {
  return (
    <Nav>
      <NavLink to="/">
        <img src={require('../../assets/gc_logo_final.png')} alt='Garbage Collector'></img>
      </NavLink>

      <Bars />
      <NavMenu>
        <NavLink to="/About" activeStyle>
          About
        </NavLink>
        <NavLink to="/Contact" activeStyle>
          Contact
        </NavLink>
        <NavLink to="/Signup" activeStyle>
          Sign Up
        </NavLink>
        <NavBtn>
        <NavBtnLink to="/Signin">Sign in</NavBtnLink>
        </NavBtn>
      </NavMenu>
      {/* 1st nav (centered)
      <NavBtn>
        <NavBtnLink to="/signin">Sign in</NavBtnLink>
      </NavBtn> */}
    </Nav>
  )
}

export default Navbar;