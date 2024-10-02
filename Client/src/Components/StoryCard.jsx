import React from 'react';
import './StoryCard.css'; // You can create and customize the CSS file for styling

const StoryCard = ({ image, heading, description, onClick }) => {
  const isVideo = (url) => {
    return url && (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg'));
  };

  return (
    <div className="story-card" onClick={onClick}>
      <div className="story-card-image-wrapper">
        {isVideo(image) ? (
          <video
            src={image}
            autoPlay
            loop
            muted
            className="story-card-video" // Add class for styling
          />
        ) : (
          <img
            src={image}
            alt={heading}
            className="story-card-image"
          />
        )}
      </div>
      <div className="story-card-content">
        <h3>{heading}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default StoryCard;
