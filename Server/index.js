const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const socket = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const UserSchema = require('../Server/Schema/UserSchema');
const Story = require('../Server/Schema/Story');
const Auth = require('../Server/MiddleWare/Auth');

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

const isUserLoggedin = (req, res, next) => {
    if (req.user && req.user.id) {
        next();
    } else {
        res.status(401).json({ status: 'Unauthorized' });
    }
};

let io; // Declare io variable for socket.io

// Create a story
app.post('/stories', Auth, isUserLoggedin, async (req, res) => {
    const { slides, userId ,category} = req.body;

    // Check if slides and userId are provided
    if (!slides || !Array.isArray(slides)) {
        return res.status(400).json({ error: 'Slides data is required and should be an array.' });
    }

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        // Create a unique ID for the story
        const storyId = uuidv4();
        const newStory = new Story({
            storyId,
            slides,
            userId ,
            category// Include userId here
        });

        await newStory.save();

        // Emit the new story to all connected clients
        const stories = await Story.find({ userId }); // Fetch updated stories
        io.emit('user-stories', stories); // Send updated stories to all clients

        res.status(201).json({ message: 'Story created successfully!', storyId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create the story.' });
    }
});

// Get user stories
app.get('/user/stories', Auth, async (req, res) => {
    try {
      const userId = req.user.id; // User ID from the authenticated request
  
      // Fetch stories from the database for the given userId
      const stories = await Story.find({ userId });
  
      if (stories.length === 0) {
        return res.status(404).json({ message: 'No stories found for this user.' });
      }
  
      // Format the stories before emitting
      const formattedStories = stories.map(story => ({
        storyId: story._id,
        slides: story.slides.map(slide => ({
          slideId: slide._id,
          heading: slide.heading,
          description: slide.description,
          image: slide.image,
        })),
      }));
  
      // Emit the stories to this specific user through their socket connection
     
        io.emit(`user-stories-${userId}`, formattedStories);
        console.log(`Sent user ${userId} stories to their socket.`,formattedStories);
      
  
      // Respond with the stories
      res.status(200).json(formattedStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      res.status(500).json({ error: 'Failed to retrieve stories.' });
    }
  });

  app.get('/user/stories/all', async (req, res) => {
    try {
  
     
        const stories = await Story.find();
      // Format the stories before emitting
      const formattedStories = stories.map(story => ({
        storyId: story._id,
        slides: story.slides.map(slide => ({
          slideId: slide._id,
          heading: slide.heading,
          description: slide.description,
          image: slide.image,
        })),
      }));
      
  
      // Respond with the stories
      res.status(200).json(formattedStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      res.status(500).json({ error: 'Failed to retrieve stories.' });
    }
  });





// Update a story
app.put('/stories/:storyId', async (req, res) => {
    const { storyId } = req.params; // Get the storyId from the request parameters
    const { slides, category, likedBy, bookmark } = req.body; // Destructure necessary fields from the request body

    // Validate the incoming data
    if (!slides || !Array.isArray(slides)) {
        return res.status(400).json({ error: 'Slides data is required and should be an array.' });
    }
    
    if (!category) {
        return res.status(400).json({ error: 'Category is required.' });
    }

    console.log('Updating story:', storyId);

    try {
        // Attempt to update the story using the PUT method
        const updatedStory = await Story.findByIdAndUpdate(
            storyId,
            { slides, category, likedBy, bookmark }, // Update all fields provided
            { new: true, runValidators: true } // Return the updated document and run validation
        );

        if (!updatedStory) {
            return res.status(404).json({ error: 'Story not found.' });
        }

        console.log('Updated story:', updatedStory);    

        // Emit the updated story to all connected clients
        const userId = updatedStory.userId; // Get the userId of the updated story
        const stories = await Story.find({ userId }); // Fetch updated stories
        io.emit('user-stories', stories); // Emit updated stories

        res.status(200).json({ message: 'Story updated successfully!', story: updatedStory });
    } catch (error) {
        console.error('Error updating story:', error);
        res.status(500).json({ error: 'Failed to update the story.' });
    }
});






// Get story by storyId
app.get('/stories/:storyId', async (req, res) => {
    const { storyId } = req.params;

    // Validate the storyId format (assuming it's an ObjectId)
    if (!mongoose.Types.ObjectId.isValid(storyId)) {
        return res.status(400).json({ error: 'Invalid story ID format.' });
    }

    try {
        // Find the story by storyId
        const story = await Story.findById(storyId);

        if (!story) {
            return res.status(404).json({ error: 'Story not found.' });
        }

        // Format the story for the response
        const formattedStory = {
            storyId: story._id,
            slides: story.slides.map(slide => ({
                slideId: slide._id,
                heading: slide.heading,
                description: slide.description,
                image: slide.image,
                category: slide.category, // Include category if needed
            })),
        };

        res.status(200).json(formattedStory);
    } catch (error) {
        console.error('Error fetching story:', error);
        res.status(500).json({ error: 'Failed to retrieve story.' });
    }
});


// Like a slide
// Like a slide
app.post('/slides/:slideId/like', Auth, async (req, res) => {
    const { slideId } = req.params;
    const userId = req.user.id; // Get user ID from auth middleware

    // Validate the slideId format
    if (!mongoose.Types.ObjectId.isValid(slideId)) {
        return res.status(400).json({ error: 'Invalid slide ID format.' });
    }

    try {
        // Find the story that contains the slide
        const story = await Story.findOne({ "slides._id": slideId });

        if (!story) {
            return res.status(404).json({ error: 'Slide not found in any story.' });
        }

        // Find the slide that needs to be updated
        const slide = story.slides.id(slideId);

        // Ensure the slide exists
        if (!slide) {
            return res.status(404).json({ error: 'Slide not found in the story.' });
        }

        // Check if the user has already liked the slide
        const likedIndex = slide.likedBy.indexOf(userId);

        if (likedIndex > -1) {
            // User has already liked the slide, so remove the like
            slide.likedBy.splice(likedIndex, 1); // Remove userId from likedBy array
            await story.save(); // Save the updated story
            return res.status(200).json({ message: 'Like removed' });
        } else {
            // User has not liked the slide, so add the like
            slide.likedBy.push(userId); // Add userId to likedBy array
            await story.save(); // Save the updated story
            return res.status(200).json({ message: 'Slide liked' });
        }
    } catch (error) {
        console.error('Error liking the slide:', error);
        return res.status(500).json({ error: 'Failed to like the slide.' });
    }
});

// Route for getting the liked count of a slide
app.get('/slides/:slideId/like-count', async (req, res) => {
    const { slideId } = req.params;

    // Validate the slideId format
    if (!mongoose.Types.ObjectId.isValid(slideId)) {
        return res.status(400).json({ error: 'Invalid slide ID format.' });
    }

    try {
        // Find the story that contains the slide
        const story = await Story.findOne({ "slides._id": slideId });

        if (!story) {
            return res.status(404).json({ error: 'Slide not found in any story.' });
        }

        // Find the slide that contains the like count
        const slide = story.slides.id(slideId);
        
        // Ensure the slide exists
        if (!slide) {
            return res.status(404).json({ error: 'Slide not found in the story.' });
        }

        // Extract user IDs of users who liked the slide
        const likedByUserIds = slide.likedBy; // Assuming `likedBy` is an array of user IDs

        // Return the like count and the array of user IDs
        return res.status(200).json({
            likeCount: likedByUserIds.length,
            likedBy: likedByUserIds // Return the array of user IDs who liked the slide
        });
    } catch (error) {
        console.error('Error fetching like count:', error);
        return res.status(500).json({ error: 'Failed to fetch like count.' });
    }
});




app.post('/slides/:slideId/bookmark', Auth, async (req, res) => {
    const { slideId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(slideId)) {
        return res.status(400).json({ error: 'Invalid slide ID format.' });
    }

    try {
        const story = await Story.findOne({ "slides._id": slideId });

        if (!story) {
            return res.status(404).json({ error: 'Slide not found in any story.' });
        }

        const slide = story.slides.id(slideId);

        if (!slide) {
            return res.status(404).json({ error: 'Slide not found in the story.' });
        }

        const bookmarkedIndex = slide.bookmarkedBy.indexOf(userId);

        if (bookmarkedIndex > -1) {
            slide.bookmarkedBy.splice(bookmarkedIndex, 1); // Remove bookmark
            await story.save();
            return res.status(200).json({ message: 'Bookmark removed' });
        } else {
            slide.bookmarkedBy.push(userId); // Add bookmark
            await story.save();
            return res.status(200).json({ message: 'Slide bookmarked' });
        }
    } catch (error) {
        console.error('Error bookmarking the slide:', error);
        return res.status(500).json({ error: 'Failed to bookmark the slide.' });
    }
});


// Get bookmarked slides for the logged-in user
app.get('/user/bookmarked/slides', Auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch stories containing bookmarked slides for the user
        const stories = await Story.find({ "slides.bookmarkedBy": userId });

        console.log('Fetched stories:', stories); // Log fetched stories

        const bookmarkedSlides = stories.flatMap(story =>
            story.slides
                .filter(slide => slide.bookmarkedBy.includes(userId))
                .map(slide => ({
                    slideId: slide._id,
                    heading: slide.heading,
                    description: slide.description,
                    image: slide.image,
                }))
        );

        console.log('Bookmarked slides:', bookmarkedSlides); // Log the bookmarked slides

        if (bookmarkedSlides.length === 0) {
            return res.status(404).json({ message: 'No bookmarked slides found for this user.' });
        }

        res.status(200).json(bookmarkedSlides);
    } catch (error) {
        console.error('Error fetching bookmarked slides:', error);
        res.status(500).json({ error: 'Failed to retrieve bookmarked slides.' });
    }
});


app.get('/category/stories', async (req, res) => {
    try {
        const { category } = req.query; // Extract category from query parameters

        // Fetch stories based on the category
        let stories;
        if (category) {
            stories = await Story.find({ "slides.category": category });
        } else {
            stories = await Story.find();
        }

        if (stories.length === 0) {
            return res.status(404).json({ message: 'No stories found.' });
        }

        // Format stories for the response
        const formattedStories = stories.map(story => ({
            storyId: story._id,
            category: story.category,
            slides: story.slides
                .filter(slide => !category || slide.category === category)
                .map(slide => ({
                    slideId: slide._id,
                    heading: slide.heading,
                    description: slide.description,
                    image: slide.image,
                    category: slide.category,
                })),
        }));

        // Emit the fetched stories to all connected clients
        io.emit('user-stories', stories); // Emit formatted stories

        res.status(200).json(formattedStories); // Send formatted stories
    } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).json({ error: 'Failed to retrieve stories.' });
    }
});









// SignUp Route
app.post('/users/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        const userExist = await UserSchema.findOne({ username });
        if (userExist) {
            return res.status(400).json({ message: 'User Already Exists' });
        }

        const encryptedPass = await bcrypt.hash(password, 10);
        const user = new UserSchema({ username, password: encryptedPass });
        await user.save();

        res.status(201).json({ status: 'Success', message: 'User signed up successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 'Failed', message: 'Internal server error' });
    }
});

// Login Route
app.post('/users/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await UserSchema.findOne({ username }).lean();
        if (!user) {
            return res.status(400).json({ status: 'Failed', message: 'Incorrect credentials' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ status: 'Failed', message: 'Incorrect credentials' });
        }

        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_PRIVATE_KEY,
            { expiresIn: '1H' } 
        );

        res.json({ status: 'Success', message: 'User logged in successfully', token, userId: user._id, username: user.username });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ status: 'Failed', message: 'Internal server error' });
    }
});

// Server Initialization
const server = app.listen(process.env.PORT, () => {
    if (!process.env.MONGO_URL) {
        throw new Error('MONGO_URL is not defined');
    }

    mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log(`Server is up at port ${process.env.PORT} and Mongoose is connected`);
            io = socket(server); // Initialize Socket.IO after the server starts

            // io.on('connection', (socket) => {
            //     console.log('New client connected:', socket.id);

            //     socket.on('disconnect', () => {
            //         console.log('Client disconnected:', socket.id);
            //     });
            // });
        })
        .catch((error) => console.error('Mongoose connection error:', error));
});
