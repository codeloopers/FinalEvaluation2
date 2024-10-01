const mongoose = require('mongoose');

// Define the Slide schema
const SlideSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['News', 'Fruits', 'Medicine', 'Healthcare', 'Travel'], // Example categories
  },
  likedBy: {
    type: [mongoose.Schema.Types.ObjectId], // Array of user IDs who liked the slide
    default: [],
    ref: 'StoryUser',
  },
  bookmarkedBy: {
    type: [mongoose.Schema.Types.ObjectId], // Array of user IDs who bookmarked the slide
    default: [],
    ref: 'StoryUser',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const StorySchema = new mongoose.Schema({
    storyId: { type: String, required: true, unique: true },
    category: {
      type: String,
      required: true,
      enum: ['News', 'Fruits', 'Medicine', 'Healthcare', 'Travel'], // Example categories
    },

  slides: [SlideSchema], 
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId :{
    type :mongoose.Schema.Types.ObjectId,
    ref:'StoryUser'
  }
});

// Create the Story model
const Story = mongoose.model('Story', StorySchema);

module.exports = Story;
