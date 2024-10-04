import React, { useState, useEffect } from "react";
import "./Modal.css"; // Include your styles here
import closeIcon from "../Images/Vector.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

const Loader = () => <div className="loader">Loading...</div>;

const EditSlideModal = ({ storyId, closeModal }) => {
  const categories = ["News", "Fruits", "Medicine", "Healthcare", "Travel"];
  const token = localStorage.getItem("token"); // Replace 'token' with the actual key if it's different

  const [slides, setSlides] = useState([
    { id: 1, heading: "", description: "", image: "", category: "" },
    { id: 2, heading: "", description: "", image: "", category: "" },
    { id: 3, heading: "", description: "", image: "", category: "" },
  ]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [category, setCategory] = useState(""); // Global category state
  const [errors, setErrors] = useState({}); // Validation errors
  const [showErrorDialog, setShowErrorDialog] = useState(false); // State to show/hide the dialog
  const [loading, setLoading] = useState(false); // Loading state
  const [loaderVisible, setLoaderVisible] = useState(false); // Loader visibility

  const handleInputChange = (index, field, value) => {
    const updatedSlides = [...slides];
    updatedSlides[index][field] = value;
    setSlides(updatedSlides);

    // Clear error when input changes
    setErrors((prevErrors) => ({
      ...prevErrors,
      [`${field}-${index}`]: "", // Clear the specific error
    }));
  };
  
  useEffect(() => {
    const fetchStoryData = async () => {
      try {
        const response = await fetch(
          `https://finalevaluation2.onrender.com/stories/${storyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        // Log the response status and headers
        console.log('Response Status:', response.status);
        console.log('Response Headers:', response.headers);
  
        const data = await response.json();
        console.log("Fetched story data:", data);
  
        if (response.ok) {
          // Check if data.slides exists and is an array before mapping
          if (Array.isArray(data.slides)) {
            // Set fetched slides data and category for each slide
            setSlides(
              data.slides.map((slide) => ({
                ...slide,
                category: slide.category || "", // Ensure category is present
              }))
            );
          } else {
            toast.error("No slides found in the story data");
            console.error("Invalid story data format:", data);
          }
        } else {
          toast.error("Failed to fetch story data");
          console.error("Error fetching story data:", data.error);
        }
      } catch (error) {
        toast.error("An error occurred while fetching story data");
        console.error("Error during fetch:", error);
      }
    };
  
    fetchStoryData();
  }, [storyId, token]);
  


  const handleCategoryChange = (value) => {
    // Clone the slides array
    const updatedSlides = slides.map(slide => ({
      ...slide,
      category: value // Update category for all slides
    }));
  
    // Update the global category
    setCategory(value); // Set the global category to the selected value
  
    // Set the updated slides array
    setSlides(updatedSlides);
  
    // Log to verify changes
    console.log(`Category updated for all slides to:`, value);
  };
  
  const handleCloseModal = () => {
    closeModal(); // Call the close modal function
    window.location.reload(); // Refresh the /dashboard page
  };
  
  
  
  const addSlide = () => {
    if (slides.length < 6) {
      const newSlide = {
        id: slides.length + 1,
        heading: "",
        description: "",
        image: "",
      };
      setSlides([...slides, newSlide]);
      setActiveSlide(slides.length); // Navigate to the newly added slide
    }
  };
  

  const removeSlide = (index) => {
    if (slides.length > 3) {
      const updatedSlides = slides.filter((_, i) => i !== index);
      setSlides(updatedSlides);

      // Determine the new active slide
      setActiveSlide((prev) => {
        if (prev > index) {
          return prev - 1; // Move back if the current slide was after the removed one
        }
        return Math.max(prev - 1, 0); // If the current slide was before the removed one, stay on the current or go to the previous
      });
    }
  };

  // Validate all slides and category
  const validateAllSlides = () => {
    let isValid = true;
    const newErrors = {};

    slides.forEach((slide, index) => {
      const { heading, description, image, category } = slide;

      if (!heading) {
        isValid = false;
        newErrors[`heading-${index}`] = "Heading is required";
      }

      if (!description) {
        isValid = false;
        newErrors[`description-${index}`] = "Description is required";
      }

      if (!image) {
        isValid = false;
        newErrors[`image-${index}`] = "Image URL is required";
      }

      // Validate category for each slide
      if (!category) {
        isValid = false;
        newErrors[`category-${index}`] = "Category is required"; // Change this to index specific
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handlePost = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (validateAllSlides()) {
      setLoading(true); // Show the loader
      setLoaderVisible(true); // Show the loader in the center

      // Prepare the data for submission
      const dataToSend = {
        slides: slides.map((slide) => ({
          heading: slide.heading,
          description: slide.description,
          image: slide.image,
          category: slide.category,
        })),
        userId: userId,
        category: category, // Attach the category here
      };

      // Console log the payload before sending
      console.log("Payload to be sent:", dataToSend);

      try {
        const response = await fetch(
          `https://finalevaluation2.onrender.com/stories/${storyId}`,
          {
            method: "PUT", // Change to PATCH method
            headers: {
              "Content-Type": "application/json", // Ensure it's JSON
              Authorization: `Bearer ${token}`, // Add Bearer token here
            },
            body: JSON.stringify(dataToSend), // Send the slides data
          }
        );

        const result = await response.json();

        if (response.ok) {
          console.log("Success:", result);
          toast.success("Story updated successfully!"); // Show success toast
          setTimeout(() => {
            closeModal(); // Close modal after 2 seconds
            window.location.reload(); // Refresh the /dashboard page
          }, 1000); // Close modal after 2 seconds
        } else {
          toast.error("Failed to update the story"); // Show error toast
        }
      } catch (error) {
        console.error("Error during submission:", error);
        toast.error("Failed to update the story"); // Show error toast
      } finally {
        // Hide loader after 2 seconds
        setTimeout(() => {
          setLoaderVisible(false);
          setLoading(false); // Hide the loading state
        }, 2000);
      }
    } else {
      // Show error dialog if validation fails
      setShowErrorDialog(true);
    }
  };

  const closeErrorDialog = () => {
    setShowErrorDialog(false);
  };

  // Handle navigation to the next slide
  const handleNextSlide = () => {
    if (activeSlide < slides.length - 1) {
      setActiveSlide(activeSlide + 1); // Move to next slide without validation
    }
  };

  // Handle navigation to the previous slide
  const handlePreviousSlide = () => {
    if (activeSlide > 0) {
      setActiveSlide(activeSlide - 1); // Move to previous slide without validation
    }
  };

  // Function to open the slide modal
  const openSlideModal = () => {
    // Your logic to open the slide modal
    console.log("Slide modal opened");
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <img
          src={closeIcon}
          alt="Close"
          className="close-iconModal"
          onClick={handleCloseModal}
        />
        <div className="slide-tabs">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide-tab ${activeSlide === index ? "active" : ""}`}
              onClick={() => {
                setActiveSlide(index); // Set active slide
                openSlideModal(); // Call openSlideModal function
              }}
            >
              Slide {index + 1}
            </div>
          ))}
        </div>

        <div className="slide-form">
          {slides[activeSlide] && (
            <>
              <div className="form-group">
                <label>Heading:</label>
                <input
                  type="text"
                  value={slides[activeSlide].heading}
                  className={
                    errors[`heading-${activeSlide}`] ? "error-input" : ""
                  }
                  onChange={(e) =>
                    handleInputChange(activeSlide, "heading", e.target.value)
                  }
                  placeholder={
                    errors[`heading-${activeSlide}`] || "Your heading"
                  }
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={slides[activeSlide].description}
                  className={
                    errors[`description-${activeSlide}`] ? "error-input" : ""
                  }
                  onChange={(e) =>
                    handleInputChange(
                      activeSlide,
                      "description",
                      e.target.value
                    )
                  }
                  placeholder={
                    errors[`description-${activeSlide}`] || "Story Description"
                  }
                />
              </div>
              <div className="form-group">
                <label>Image:</label>
                <input
                  type="text"
                  value={slides[activeSlide].image}
                  className={
                    errors[`image-${activeSlide}`] ? "error-input" : ""
                  }
                  onChange={(e) =>
                    handleInputChange(activeSlide, "image", e.target.value)
                  }
                  placeholder={
                    errors[`image-${activeSlide}`] || "Add Image URL"
                  }
                />
              </div>
              <div className="form-group">
  <label>Category:</label>
  <select
    value={slides[activeSlide].category || ''} // Ensure this binds to the correct active slide's category
    className={errors[`category-${activeSlide}`] ? 'error-input' : ''}
    onChange={(e) => {
      const newCategory = e.target.value; // Get the new category value
      handleCategoryChange(newCategory); // Update the category for all slides
    }}
  >
    <option value="">Select category</option>
    {categories.map((cat, index) => (
      <option key={index} value={cat}> 
        {cat}
      </option>
    ))}
  </select>
</div>

            </>
          )}
        </div>

        <div className="navigation-buttons">
          <div className="btn-group">
            <button
              className="slidebtn prev"
              onClick={handlePreviousSlide}
              disabled={activeSlide === 0}
            >
              Previous
            </button>
            <button
              className="slidebtn nxt"
              onClick={handleNextSlide}
              disabled={activeSlide === slides.length - 1}
            >
              Next
            </button>
          </div>
          <button className="post-button slidebtn" onClick={handlePost}>
            Post
          </button>
        </div>

        {/* Error dialog */}
        {showErrorDialog && (
          <div className="error-dialog-overlay">
            <div className="error-dialog">
              <h2>Validation Error</h2>
              <p>All fields are required.</p>
              <button className="close-dialog-btn" onClick={closeErrorDialog}>
                OK
              </button>
            </div>
          </div>
        )}

        {/* Loader */}
        {loaderVisible && (
          <div className="loader-overlay">
            <Loader />
          </div>
        )}
      </div>

      {/* Toast Container for notifications */}
      <ToastContainer />
    </div>
  );
};

export default EditSlideModal;
