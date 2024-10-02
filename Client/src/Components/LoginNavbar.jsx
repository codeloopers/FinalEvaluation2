import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Navbar.css';

const LoginNavbar = ({ openModal }) => {
  const username = localStorage.getItem('username');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    
    
    toast.success('Logged out successfully!', {
      position: "top-right",
      autoClose: 3000,
    });
    setTimeout(() => {
      navigate('/');
    }, 1000); 
  };

  // Navigate to Dashboard or BookmarkedStories based on current route
  const handleBookmarkClick = () => {
    if (location.pathname === '/bookmarks') {
      navigate('/dashboard'); // Navigate to Dashboard
    } else {
      navigate('/bookmarks'); // Navigate to BookmarkedStories
    }
  };

  return (
    <>
      <ToastContainer />
      <nav className="navbar">
        <div className="navbar-buttons">
          <button className="btn bookmark" onClick={handleBookmarkClick}>
            {location.pathname === '/bookmarks' ? (
              <>
                {/* No image when bookmarks are open */}
                Dashboard
              </>
            ) : (
              <>
                <i className="fas fa-bookmark"></i>
                Bookmark
              </>
            )}
          </button>
          <button className="btn add-story" onClick={openModal}>
            Add Story
          </button>
        </div>
        <div className="profile-section">
          <button className="hamburger" onClick={toggleMenu}>
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="menu">
          <div className="menu-item">{username}</div>
          <button className="btn logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </>
  );
};

export default LoginNavbar;
