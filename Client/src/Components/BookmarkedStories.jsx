import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import StoryCard from './StoryCard';
import LoginNavbar from './LoginNavbar';
import SlideModal from '../Modal/SlideModal'; // Import SlideModal

const BookmarkedStories = () => {
  const [bookmarkedStories, setBookmarkedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false); // Control SlideModal visibility
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const token = localStorage.getItem('token');

    // If token is not found, redirect to login page
    if (!token) {
      navigate('/');
      return; // Return early to prevent further execution
    }

    const fetchBookmarkedSlides = async () => {
      try {
        const response = await axios.get('https://finalevaluation2.onrender.com/user/bookmarked/slides', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBookmarkedStories(response.data); // Store bookmarked stories
      } catch (error) {
        console.error('Error fetching bookmarked slides:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarkedSlides();
  }, [navigate]);

  // Function to open the SlideModal
  const openSlideModal = () => {
    setIsSlideModalOpen(true);
  };

  // Function to close the SlideModal
  const closeSlideModal = () => {
    setIsSlideModalOpen(false);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <div>Loading bookmarked stories...</div>
      </div>
    );
  }

  return (
    <>
      <LoginNavbar openModal={openSlideModal} /> {/* Pass openSlideModal to LoginNavbar */}
      <h3 className='book-tag'>Your Bookmarked </h3>
      
      
      <div className="bookmarked-stories-container">
        {bookmarkedStories.length === 0 ? (
          <div>No bookmarked stories found.</div>
        ) : (
          <div className="stories-container">
            {bookmarkedStories.map((slide) => (
              <StoryCard
                key={slide.slideId}
                image={slide.image}
                heading={slide.heading}
                description={slide.description}
                onClick={() => { /* Open modal on card click */ }}
              />
            ))}
          </div>
        )}

        {/* Render SlideModal when Add Story button is clicked */}
        {isSlideModalOpen && <SlideModal closeModal={closeSlideModal} />}
      </div>
    </>
  );
};

export default BookmarkedStories;
