import React from 'react';
import './Navbar.css';

const Navbar = ({ onRegisterClick, onLoginClick }) => {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-buttons">
          <button className="btn register" onClick={onRegisterClick}>
            Register Now
          </button>
          <button className="btn signin" onClick={onLoginClick}>
            Sign In
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
