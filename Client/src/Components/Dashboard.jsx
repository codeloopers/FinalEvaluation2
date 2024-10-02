import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import './Dashboard.css';
import Navbar from './Navbar';
import LoginModal from '../Modal/LoginModal';
import RegisterModal from '../Modal/RegisterModal';
import StoryCard from './StoryCard';
import axios from 'axios';
import Image1 from '../Images/AllNews.png';
import Image2 from '../Images/Fruits.png';
import Image3 from '../Images/Medicine.png';
import Image4 from '../Images/Healthcare.png';
import Image5 from '../Images/Travel.png';
import StorySlideModal from '../Modal/StorySlideModal';
import StoryModal from '../Modal/SlideModal';
import News from '../Images/News.webp';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false); // State for StorySlideModal
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null); // Story for StorySlideModal
  const [categoryStories, setCategoryStories] = useState([]);
  const [allNewsStories, setAllNewsStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allNewsLoaded, setAllNewsLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const sectionRefs = useRef({});

  const images = [
    { src: Image1, title: 'All News', sectionId: 'allNews' },
    { src: News, title: 'News', sectionId: 'news' },
    { src: Image2, title: 'Fruits', sectionId: 'fruits' },
    { src: Image3, title: 'Medicine', sectionId: 'medicine' },
    { src: Image4, title: 'Healthcare', sectionId: 'healthcare' },
    { src: Image5, title: 'Travel', sectionId: 'travel' },
  ];

  const Loader = () => (
    <div className="loader-container">
      <div className="loader"></div>
      <span>Loading...</span>
    </div>
  );

  useEffect(() => {
    fetchCategoryStories();
    fetchAllNewsStories();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const storyId = searchParams.get('storyId');

    if (storyId) {
      fetchStoryAndOpenModal(storyId);
    }
  }, [location]);

  const fetchStoryAndOpenModal = async (storyId) => {
    try {
      const response = await axios.get(`https://finalevaluation2.onrender.com/stories/${storyId}`);
      setSelectedStory(response.data); // Correctly set selectedStory for StorySlideModal
      setIsSlideModalOpen(true); // Open StorySlideModal
    } catch (error) {
      console.error('Error fetching story:', error);
    }
  };

  const fetchCategoryStories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://finalevaluation2.onrender.com/category/stories');
      setCategoryStories(response.data);
    } catch (error) {
      console.error('Error fetching category stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllNewsStories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://finalevaluation2.onrender.com/user/stories/all');
      setAllNewsStories(response.data);
      setAllNewsLoaded(true); // Mark all news as loaded
    } catch (error) {
      console.error('Error fetching all news stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (sectionId) => {
    setSelectedCategory(sectionId);
    if (sectionId === 'allNews') {
      setSelectedCategory(null);
      if (!allNewsLoaded) {
        fetchAllNewsStories();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const section = sectionRefs.current[sectionId];
      if (section) {
        const offset = 100;
        const sectionPosition = section.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: sectionPosition, behavior: 'smooth' });
      }
    }
  };

  const handleCardClick = (story) => {
    setSelectedStory(story); // Set the selected story
    setIsSlideModalOpen(true); // Open StorySlideModal
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeSlideModal = () => {
    setIsSlideModalOpen(false); // Close StorySlideModal
    setSelectedStory(null); // Clear selected story
  };

  const openLoginModal = () => {
    setIsLoginOpen(true);
  };

  const openRegisterModal = () => {
    setIsRegisterOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginOpen(false);
  };

  const closeRegisterModal = () => {
    setIsRegisterOpen(false);
  };

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <Navbar onRegisterClick={openRegisterModal} onLoginClick={openLoginModal} />

      <div className="container">
        <div className="image-container fixed-image-container">
          {images.map((image, index) => (
            <div className="image-wrapper" key={index} onClick={() => scrollToSection(image.sectionId)}>
              <img src={image.src} alt={`Slide ${index + 1}`} className="image" />
              <div className="overlay">
                <span className="image-text">{image.title}</span>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
           <Loader />
        ) : (
          <>
            {selectedCategory === null && allNewsLoaded && (
              <>
                {images.slice(1).map((image) => (
                  <div key={image.sectionId} ref={(el) => (sectionRefs.current[image.sectionId] = el)} className="stories-section">
                    <h2>{image.title} Stories</h2>
                    <div className="stories-container">
                    {categoryStories.filter(story => story.category && story.category.toLowerCase() === image.title.toLowerCase()).length > 0 ? (
  categoryStories
    .filter(story => story.category && story.category.toLowerCase() === image.title.toLowerCase())
    .map(story => (
      <StoryCard
        key={story.storyId}
        image={story.slides[0].image}
        heading={story.slides[0].heading}
        description={story.slides[0].description}
        onClick={() => handleCardClick(story)}
      />
    ))
) : (
  <p>No stories available.</p> // Show this when there are no filtered stories
)}

                    </div>
                  </div>
                ))}
              </>
            )}

{images.map((image) => (
  selectedCategory === image.sectionId && (
    <div key={image.sectionId} ref={(el) => (sectionRefs.current[image.sectionId] = el)} className="stories-section">
      <h2>{image.title} Stories</h2>
      <div className="stories-container">
        {/* Filter stories based on category */}
        {categoryStories
          .filter(story => story.category && story.category.toLowerCase() === image.title.toLowerCase()).length > 0 ? (
          categoryStories
            .filter(story => story.category && story.category.toLowerCase() === image.title.toLowerCase())
            .map(story => (
              <StoryCard
                key={story.storyId}
                image={story.slides[0].image}
                heading={story.slides[0].heading}
                description={story.slides[0].description}
                onClick={() => handleCardClick(story)}
              />
            ))
        ) : (
          <p>No stories available.</p> // Display message when no stories match the filtered category
        )}
      </div>
    </div>
  )
))}

          </>
        )}
      </div>

      {isModalOpen && <StoryModal closeModal={closeModal} />}
      {isSlideModalOpen && selectedStory && (
        <StorySlideModal story={selectedStory} closeModal={closeSlideModal} />
      )}

      <LoginModal isOpen={isLoginOpen} onClose={closeLoginModal} onLoginSuccess={handleLoginSuccess} />
      <RegisterModal isOpen={isRegisterOpen} onClose={closeRegisterModal} onRegisterSuccess={openLoginModal} />
    </>
  );
};

export default Dashboard;
