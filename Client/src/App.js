import React,{useState} from 'react';
import { BrowserRouter as Router, Routes, Route,useLocation } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute'; // Adjust the path to your ProtectedRoute
import MainDashboard from './Components/MainDashboard'; // Adjust the path to your MainDashboard
import Dashboard from './Components/Dashboard'; // Adjust the path to your Dashboard
import BookmarkedStories from './Components/BookmarkedStories';
import StorySlideModal from './Modal/StorySlideModal';


const App = () => {

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Dashboard/>} />

        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <BookmarkedStories />
            </ProtectedRoute>
          }
        />
        

  
      </Routes>
    </Router>
  );
};

export default App;
