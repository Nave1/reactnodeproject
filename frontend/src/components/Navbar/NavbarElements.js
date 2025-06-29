// src/components/Navbar/NavbarElements.js
import styled from 'styled-components';
import { NavLink as Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

/* צבעי הרקע - החלף לצבע שלך (גרדיאנט/אחר) */
export const Nav = styled.nav`
  background: linear-gradient(135deg, #0062E6, #33AEFF);
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  position: relative;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
`;

/* לוגו */
export const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  cursor: pointer;

  img {
    height: 150px;
    width: auto;
    max-width: 150px;
  }
`;

/* הקישורים בניווט (Desktop) */
export const NavMenu = styled.div`
  display: flex;
  align-items: center;
  transition: all 0.3s ease;

  @media screen and (max-width: 768px) {
    position: absolute;
    top: 80px;
    right: ${({ isOpen }) => (isOpen ? '0' : '-100%')};
    background: linear-gradient(135deg, #0062E6, #33AEFF);
    flex-direction: column;
    width: 100%;
    z-index: 999;
    padding: 1rem 0;
  }
`;

/* קישור (NavLink) */
export const NavLink = styled(Link)`
  color: #fff;
  display: flex;
  align-items: center;
  position: relative;
  text-decoration: none;
  margin: 0 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s ease;

  &.active {
    color: #ffd700;
  }

  &:hover {
    color: #ffd700;
  }

  &:active {
    transform: scale(0.95);
  }
`;

/* כפתור/עטיפת כפתור (Sign in וכו') */
export const NavBtn = styled.div`
  display: flex;
  align-items: center;
  margin-left: 24px;

  @media screen and (max-width: 768px) {
    margin: 1rem 0;
  }
`;

export const NavBtnLink = styled(Link)`
  border-radius: 4px;
  background: #fff;
  padding: 10px 22px;
  color: #0062e6;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.3s ease, transform 0.2s ease;
  border: none;
  outline: none;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.8);
  }
  &:active {
    transform: scale(0.96);
  }
`;

/* כפתור ההמבורגר (3 פסים) */
export const Hamburger = styled.div`
  display: none;
  cursor: pointer;
  height: 24px;
  width: 30px;
  flex-direction: column;
  justify-content: space-between;

  @media screen and (max-width: 768px) {
    display: flex;
  }
`;

/* פס בודד בתוך ההמבורגר */
export const Bar = styled.span`
  height: 3px;
  width: 100%;
  background-color: #fff;
  border-radius: 2px;
  transition: all 0.3s ease;

  &:nth-child(1) {
    transform: ${({ isOpen }) =>
      isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'};
  }

  &:nth-child(2) {
    opacity: ${({ isOpen }) => (isOpen ? '0' : '1')};
    transform: ${({ isOpen }) =>
      isOpen ? 'translateX(-20px)' : 'translateX(0)'};
  }

  &:nth-child(3) {
    transform: ${({ isOpen }) =>
      isOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none'};
  }
`;

/* אייקון FaBars גיבוי */
export const Bars = styled(FaBars)`
  display: none;

  @media screen and (max-width: 768px) {
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(-100%, 75%);
    font-size: 1.8rem;
    cursor: pointer;
    color: #fff;
  }
`;

/* אייקון FaTimes גיבוי */
export const Times = styled(FaTimes)`
  display: none;

  @media screen and (max-width: 768px) {
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(-100%, 75%);
    font-size: 1.8rem;
    cursor: pointer;
    color: #fff;
  }
`;

// Group container for links (admin/user nav links)
export const NavLinksGroup = styled.div`
  display: flex;
  align-items: center;
  margin-left: 1.5rem;
  gap: 0.5rem;
`;

// The separator (|)
export const NavSeparator = styled.span`
  margin: 0 0.4rem;
  color: #ffd700;
  font-size: 20px;
  font-weight: 600;
  user-select: none;
  letter-spacing: 1px;
`;

