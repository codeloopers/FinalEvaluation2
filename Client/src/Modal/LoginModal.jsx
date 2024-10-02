import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Modal.css'; // Ensure to include your styles
import closeIcon from '../Images/Vector.png'; // Adjust the path as necessary
import eyeIcon from '../Images/eye.png'; // Adjust the path as necessary

const Loader = () => (
  <div className="loader-container">
    <div className="loader"></div>
    <span>Loading...</span>
  </div>
);

const LoginModal = ({ isOpen, onClose, onLoginSuccess, onSessionExpire }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // This effect clears the form when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      setShowPassword(false);
      setUsername('');
      setPassword('');
      setErrorMessage('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleLogin = async () => {
    if (loading) return; // Prevent double click if already loading
    setLoading(true); // Disable button and show loading

    try {
      const response = await axios.post('https://finalevaluation2.onrender.com/users/login', {
        username,
        password,
      });

      if (response.data.status === 'Success') {
        const { token, userId, username } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('username', username);

        toast.success('Login successful!', {
          position: 'top-right',
          autoClose: 5000,
        });

        setTimeout(() => {
          onLoginSuccess(username); // Call the function to handle login success
          onClose(); // Close the modal after login
          setLoading(false); // Re-enable button after request completes
        }, 1000);
      } else if (response.data.status === 'Failed') {
        setErrorMessage('Login failed. Please check your credentials.');
        toast.error('Login failed. Please check your credentials.');
        setLoading(false);
      } else {
        setErrorMessage('Login failed. Please check your credentials.');
        toast.error('Login failed. Please check your credentials.');
        setLoading(false);
      }
    } catch (error) {
      setErrorMessage('Login failed. Please check your credentials.');
      toast.error('Login failed. Please check your credentials.');
      setLoading(false); // Re-enable button even if request fails
    }
  };

  // Prevent rendering the modal if it's not open
  if (!isOpen) return null;

  return (
    <>
      <ToastContainer />
      {/* Modal backdrop */}
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal">
        <div className="modal-header">
          Login
          <img
            src={closeIcon}
            alt="Close"
            className="close-icon"
            onClick={onClose}
          />
        </div>
        <div className="modal-body">
          {loading ? (
            <Loader />
          ) : (
            <>
              <div className="form-row">
                <label htmlFor="login-username">Username</label>
                <input
                  id="login-username"
                  type="text"
                  placeholder="Enter Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="form-row">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
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
          <button onClick={handleLogin} disabled={loading}>Login</button>
        </div>
      </div>
    </>
  );
};

export default LoginModal;
