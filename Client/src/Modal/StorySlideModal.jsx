import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Heart, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../Modal/StorySlideModal.css';
import arrowleft from '../Images/leftarrow.png';
import arrowright from '../Images/rightarrow.png';
import share from '../Images/Share.png';
import io from 'socket.io-client';
import LoginModal from './LoginModal';
import download from '../Images/download.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

const socket = io(process.env.REACT_APP_SOCKET_URL || 'https://finalevaluation2.onrender.com', {
  transports: ['websocket'],
});

const StorySlideModal = ({ story, closeModal }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const id = story.storyId;


  useEffect(() => {
    setCurrentSlide(0);
  }, [story]);

  const currentSlideData = story.slides && story.slides[currentSlide] ? story.slides[currentSlide] : {};

  useEffect(() => {
    if (currentSlideData.slideId) {
      const storedBookmarkStatus = localStorage.getItem(`bookmarked_${userId}_${currentSlideData.slideId}`);
      setBookmarked(storedBookmarkStatus === 'true');

      const fetchLikeCount = async () => {
        try {
          const response = await axios.get(`https://finalevaluation2.onrender.com/slides/${currentSlideData.slideId}/like-count`);
          setLikeCount(response.data.likeCount);
          
          const userLiked = response.data.likedBy.includes(userId);
          setLiked(userLiked);
        } catch (error) {
          console.error('Error fetching like count:', error);
        }
      };

      fetchLikeCount();
    }
  }, [currentSlideData, userId]);

  const handleNext = () => {
    if (story.slides && currentSlide < story.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      closeModal();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleLike = async () => {
    const token = localStorage.getItem('token'); 
    if (!token) {
      setIsLoginModalOpen(true); 
      return;
    }

    // Optimistically update the like count and liked state
    const newLikedStatus = !liked;
    const newLikeCount = newLikedStatus ? likeCount + 1 : likeCount - 1;

    setLiked(newLikedStatus);
    setLikeCount(newLikeCount);

    try {
      await axios.post(
        `https://finalevaluation2.onrender.com/slides/${currentSlideData.slideId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Emit the updated story event
      socket.emit('story-updated', { storyId: currentSlideData.slideId });
    } catch (error) {
      console.error('Error liking slide:', error);
      // Roll back the optimistic update if there was an error
      setLiked(liked); // revert to previous state
      setLikeCount(likeCount); // revert to previous count
    }
  };

  const handleBookmark = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoginModalOpen(true);
      return;
    }

    const userID = localStorage.getItem('userId');
    const newBookmarkStatus = !bookmarked;

    // Optimistically update UI
    setBookmarked(newBookmarkStatus);
    localStorage.setItem(`bookmarked_${userID}_${currentSlideData.slideId}`, newBookmarkStatus);

    try {
      await axios.post(
        `https://finalevaluation2.onrender.com/slides/${currentSlideData.slideId}/bookmark`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socket.emit('story-updated', { storyId: currentSlideData.slideId });
    } catch (error) {
      console.error('Error bookmarking slide:', error);
      // Revert optimistic update
      setBookmarked(!newBookmarkStatus);
      localStorage.setItem(`bookmarked_${userID}_${currentSlideData.slideId}`, !newBookmarkStatus);
      toast.error('Failed to update bookmark. Please try again.');
    }
  };
  const handleShare = () => {
    const storyId = id;  // Assuming the story object has an _id field
    const shareLink = `${window.location.origin}/?storyId=${storyId}`;
    
    console.log('Share link created:', shareLink); // Debugging log

    // Copy link to clipboard
    navigator.clipboard.writeText(shareLink).then(() => {
      alert("Shareable link copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy the link:", err);
    });

    // Update the URL without reloading the page
    window.history.pushState({}, '', `/?storyId=${storyId}`);
  };

  const handleDownload = async () => {
    const imageUrl = currentSlideData.image; // Get the image URL dynamically
    
    try {
      // Fetch the image as a blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a blob URL
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a temporary anchor tag
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'downloaded-image.jpg'; // The file name for download
      
      // Append the link to the document body
      document.body.appendChild(link);
      
      // Simulate the download click
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success('Image downloaded successfully!', {
        autoClose: 3000, // Close automatically after 3 seconds
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      // Handle the error (e.g., show a message to the user)
    }
  };
  

  const handleLoginSuccess = async () => {
    setIsLoginModalOpen(false);
    const token = localStorage.getItem('token'); 

    if (token) {
      try {
        const response = await axios.get(`https://finalevaluation2.onrender.com/slides/${currentSlideData.slideId}/like-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userLiked = response.data.likedBy.includes(userId);
        setLiked(userLiked);
        setLikeCount(response.data.likeCount); // Update like count after login
      } catch (error) {
        console.error('Error checking like status after login:', error);
      }
    }
  };

  const isVideo = currentSlideData.image && (currentSlideData.image.endsWith('.mp4') || currentSlideData.image.endsWith('.webm') || currentSlideData.image.endsWith('.ogg'));

  return (
    <div className="custom-modal-container">
      <div className="custom-modal-content">
        <div className="gradient-overlay-top" />
        <div className="custom-progress-bar">
          {story.slides && story.slides.map((_, index) => (
            <div
              key={index}
              className={`custom-progress-segment ${index <= currentSlide ? 'active' : ''}`}
            />
          ))}
        </div>
        <div className="custom-modal-header">
  {/* Close Button */}
  <button 
    className="custom-close-button" 
    onClick={() => {
      closeModal(); 
      navigate('/dashboard'); 
    }} 
    aria-label="Close modal"
  >
    <i className="fa fa-times" aria-hidden="true"></i> {/* Close icon */}
  </button>

  {/* Share Button */}
  <button 
    className="custom-share-button" 
    onClick={() => {
     handleShare();
    }} 
    aria-label="Share"
  >
    <img src={share} alt="Share" className="share-icon" /> {/* Share image */}
  </button>
</div>

        <div className="custom-main-content">
          {isVideo ? (
            <video
              src={currentSlideData.image}
              autoPlay
              loop
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <img
              src={currentSlideData.image || 'fallback-image-url.jpg'}
              alt={currentSlideData.heading || 'Slide Image'}
              className="custom-slide-image"
              style={{ width: '100%', height: '100%', objectFit: 'cover'}} 
            />
          )}
          <div className="custom-slide-text">
            <h2>{currentSlideData.heading || 'Slide Title'}</h2>
            <p>{currentSlideData.description || 'Slide Description'}</p>
          </div>

          <div className="custom-buttons-container">
            <button
              className={`custom-bookmark-button ${bookmarked ? 'bookmarked' : ''}`}
              aria-label="Bookmark this story"
              onClick={handleBookmark}
            >
              <Bookmark />
            </button>
            <img src={download} alt="download"  className='download' 
          onClick={handleDownload} 
          aria-label="Download this image"/>
            <div
              className={`custom-likes ${liked ? 'liked' : ''}`}
              onClick={handleLike}
              aria-label="Like this slide"
              style={{ color: liked ? 'red' : 'white' }} 
            >
              <Heart />
              <span>{likeCount}</span>
            </div>
          </div>
        </div>
        <div className="gradient-overlay-bottom" />
      </div>

      <img 
        className="custom-nav-arrow custom-prev-arrow" 
        src={arrowleft}
        alt="Previous slide" 
        onClick={handlePrev} 
      />
      <img 
        className="custom-nav-arrow custom-next-arrow" 
        src={arrowright}
        alt="Next slide" 
        onClick={handleNext} 
      />

      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess} 
        />
      )}
    </div>
  );
};

export default StorySlideModal;
