import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import LoginNavbar from './LoginNavbar';
import StoryModal from '../Modal/SlideModal';
import StorySlideModal from '../Modal/StorySlideModal';
import StoryCard from './StoryCard';
import Image1 from '../Images/AllNews.png';
import Image2 from '../Images/Fruits.png';
import Image3 from '../Images/Medicine.png';
import Image4 from '../Images/Healthcare.png';
import Image5 from '../Images/Travel.png';
import io from 'socket.io-client';
import axios from 'axios';
import EditSlideModal from '../Modal/EditSlideModal';
import editImage from '../Images/Group.png';
import News from '../Images/News.webp';

// Establish socket connection
const socket = io(process.env.REACT_APP_SOCKET_URL || 'https://finalevaluation2.onrender.com', {
  transports: ['websocket'],
});

const MainDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [stories, setStories] = useState([]);
  const [categoryStories, setCategoryStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('allNews'); // Default to All News
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState(null);  //
  const navigate = useNavigate();

  const images = [
    { src: Image1, title: 'All News', sectionId: 'allNews' },
    { src: News, title: 'News', sectionId: 'news' },
    { src: Image2, title: 'Fruits', sectionId: 'fruits' },
    { src: Image3, title: 'Medicine', sectionId: 'medicine' },
    { src: Image4, title: 'Healthcare', sectionId: 'healthcare' },
    { src: Image5, title: 'Travel', sectionId: 'travel' },
  ];

  const sectionRefs = useRef({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token) {
      console.log('No token found, cannot fetch data.');
      return;
    }

    fetchCategoryStories(); // Fetch category stories independently

    const userStoriesEvent = `user-stories-${userId}`;
    setupSocketListener(userStoriesEvent);

    // Fetch user stories initially
    fetchUserStories(token);

    return () => {
      socket.off(userStoriesEvent); // Clean up socket listener
      socket.off('story-updated'); // Clean up the 'story-updated' listener
      console.log('Cleaned up on unmount');
    };
  }, []);

  const setupSocketListener = (userStoriesEvent) => {
    console.log('Setting up socket listener for:', userStoriesEvent);
    socket.on(userStoriesEvent, (fetchedStories) => {
      console.log('Received user stories:', fetchedStories);
      setStories(fetchedStories);
    });

    // Listen for the 'story-updated' event
    socket.on('story-updated', () => {
      console.log('Story updated, fetching user stories again.');
      fetchUserStories(localStorage.getItem('token')); // Re-fetch user stories when an update occurs
    });
  };

  const fetchCategoryStories = async () => {
    try {
      const response = await axios.get('https://finalevaluation2.onrender.com/category/stories');
      console.log('Fetched category stories:', response.data);
      setCategoryStories(response.data);
    } catch (error) {
      console.error('Error fetching category stories:', error);
    }
  };

  const fetchUserStories = async (token) => {
    setLoading(true);
    try {
      const response = await fetch('https://finalevaluation2.onrender.com/user/stories', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        console.log('Unauthorized access, clearing token.');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        return; // No need to navigate, the component will re-render
      }

      const result = await response.json();
      console.log('Fetched user stories:', result);
      if (response.ok) {
        setStories(result);
      } else {
        console.error('Error in response:', result.message);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
      console.log('Loading state set to false.');
    }
  };

  const openModal = () => {
    console.log('Opening modal.');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    console.log('Closing modal.');
    setIsModalOpen(false);
    // Trigger the refresh of user stories and category stories after the modal closes
    fetchUserStories(localStorage.getItem('token')); // Re-fetch user stories
    fetchCategoryStories(); // Re-fetch category stories
  };

  const handleCardClick = (story) => {
    console.log('Selected story:', story);
    console.log('Selected id:', story.storyId);
    setSelectedStory(story);
    setIsSlideModalOpen(true);
  };

  const closeSlideModal = () => {
    console.log('Closing slide modal.');
    setIsSlideModalOpen(false);
    setSelectedStory(null);
  };

  const handleEditStory = (storyId) => {
    console.log('Editing story with ID:', storyId);
    setSelectedStoryId(storyId); 
    setIsEditModalOpen(true);  // Open the edit modal
  };
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Function to handle closing the modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);  // Close the edit modal
  };

  const toggleShowMore = () => {
    setShowMore(!showMore);
    console.log('Toggled show more:', showMore);
  };

  const scrollToSection = (sectionId) => {
    setSelectedCategory(sectionId); // Set the selected category
    if (sectionId === 'allNews') {
      // Scroll to the top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.log('Scrolled to top for "All News" section');
    } else {
      const section = sectionRefs.current[sectionId];
      if (section) {
        const offset = 100; // Adjust this value based on your layout
        const sectionPosition = section.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: sectionPosition, behavior: 'smooth' });
        console.log('Scrolling to section:', sectionId);
      }
    }
  };

  // Filter the stories based on the selected category
  const filteredStories = selectedCategory === 'allNews'
    ? categoryStories // Show all stories for "All News"
    : categoryStories.filter(story => story.category.toLowerCase() === selectedCategory.toLowerCase());

  // Render all categories one after the other when "All News" is selected
  const renderAllCategories = () => {
    const categories = ['News','Fruits', 'Medicine', 'Healthcare', 'Travel'];

    return categories.map(category => {
      const categoryStories = filteredStories.filter(story => story.category.toLowerCase() === category.toLowerCase());
      return (
        <div key={category} className="category-section" ref={el => sectionRefs.current[category.toLowerCase()] = el}>
          <h2>{category} Stories</h2>
          <div className="stories-container">
            {categoryStories.length > 0 ? (
              categoryStories.map(story => (
                <StoryCard
                  key={story.storyId}
                  image={story.slides[0]?.image}
                  heading={story.slides[0]?.heading}
                  description={story.slides[0]?.description}
                  onClick={() => handleCardClick(story)}
                />
              ))
            ) : (
              <p>No stories available for this category.</p>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <LoginNavbar openModal={openModal} />

      <div className={`container ${isModalOpen || isSlideModalOpen ? 'blurred' : ''}`}>
        <div className="image-container fixed-image-container">
          {images.map((image) => (
            <div className="image-wrapper" key={image.title} onClick={() => scrollToSection(image.sectionId)}>
              <img src={image.src} alt={image.title} className="image" />
              <div className="overlay">
                <span className="image-text">{image.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your Stories section will only show when All News is selected */}
      {selectedCategory === 'allNews' && (
  <div className="your-stories" ref={(el) => (sectionRefs.current['yourStories'] = el)}>
    <h2>Your Stories</h2>
    {loading ? (
      <div className="loader-container">
        <div className="loader"></div>
        <div>Loading your stories...</div>
      </div>
    ) : stories.length === 0 ? (
      <div>No stories found for this user.</div>
    ) : (
      <div className="stories-container">
        {stories.map((story) => (
          <div key={story.storyId} className="story-card-with-edit">
            <StoryCard
              image={story.slides[0]?.image}
              heading={story.slides[0]?.heading}
              description={story.slides[0]?.description}
              onClick={() => handleCardClick(story)}
            />
            <div className="edit-container" onClick={() => handleEditStory(story.storyId)}>
            <div className='edit-button-div'>
              <img src={editImage} alt="" />
             <div 
              className="edit-button" 
              >
              Edit
            </div>
            </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}


      {/* Render sections based on the selected category */}
      <div className="categories-container">
        {selectedCategory === 'allNews' ? renderAllCategories() : (
          <div className="category-section" ref={el => sectionRefs.current[selectedCategory]}>
            <h2>{selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Stories</h2>
            <div className="stories-container">
              {filteredStories.length > 0 ? (
                filteredStories.map(story => (
                  <StoryCard
                    key={story.storyId}
                    image={story.slides[0]?.image}
                    heading={story.slides[0]?.heading}
                    description={story.slides[0]?.description}
                    onClick={() => handleCardClick(story)}
                  />
                ))
              ) : (
                <p>No stories available for this category.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && <StoryModal closeModal={closeModal} />}
{isSlideModalOpen && <StorySlideModal story={selectedStory} closeModal={closeSlideModal} />}
{isEditModalOpen && <EditSlideModal closeModal={closeEditModal} storyId={selectedStoryId}/>}

    </>
  );
};

export default MainDashboard;
