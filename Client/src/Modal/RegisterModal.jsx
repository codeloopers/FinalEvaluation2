import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './SlideModal.css';
import closeIcon from '../Images/Vector.png'; 
import eyeIcon from '../Images/eye.png';

const Loader = () => (
  <div className="loader-container">
    <div className="loader"></div>
    <span>Loading...</span>
  </div>
);

const RegisterModal = ({ isOpen, onClose, onRegisterSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowPassword(false);
      setUsername('');
      setPassword('');
      setErrorMessage('');
      setLoading(false);
    }
  }, [isOpen]);

  const validatePassword = (password) => {
    // Add your password validation logic here
    // For example, check length, special characters, etc.
    return password.length >= 6; // Example: at least 6 characters
  };

  const handleRegister = async () => {
    setLoading(true);
    
    if (!username) {
      setLoading(false);
      setErrorMessage('Username is required');
      return;
    }

    if (!validatePassword(password)) {
      setLoading(false);
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await axios.post('https://finalevaluation2.onrender.com/users/signup', {
        username,
        password,
      });

      if (response.data.status === "Success") {
        toast.success('User successfully created!', {
          position: "top-right",
          autoClose: 2000,
        });

        setTimeout(() => {
          onRegisterSuccess(); // Call the prop function
          onClose();
          setLoading(false);
        }, 2000);
      }
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data.message === "User Already Exists") {
        setErrorMessage("User Already Exists");
        toast.error("User Already Exists");
      } else {
        toast.error('An error occurred during registration. Please try again.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ToastContainer />
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal">
        <div className="modal-header">
          Register
          <img src={closeIcon} alt="Close" className="close-icon" onClick={onClose} />
        </div>
        <div className="modal-body">
          {loading ? (
            <Loader />
          ) : (
            <>
              <div className="form-row">
                <label htmlFor="register-username">Username</label>
                <input
                  id="register-username"
                  type="text"
                  placeholder="Enter Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="form-row">
                <label htmlFor="register-password">Password</label>
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <img
                  src={eyeIcon}
                  alt="Toggle Password Visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="eye-icon"
                />
              </div>
              {errorMessage && <p className='error-message' style={{ color: 'red' }}>{errorMessage}</p>}
            </>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={handleRegister} disabled={loading}>Register</button>
        </div>
      </div>
    </>
  );
};

export default RegisterModal;
