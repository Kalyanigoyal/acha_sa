import React, { useState ,useEffect} from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Login from './Login';
import Register from './Register';
import UserProfile from './UserProfile';
import FileUploadForm from './FileUploadForm';
import logSvg from './img/log.svg';
import registerSvg from './img/register.svg';
import Confirmation from './Confirmation';
import Dashboard from './Dashboard';


function App() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleRegister = () => {
    setIsLoggedIn(true);
  };

 

  return (
    
    <div className={`container ${isSignUpMode ? 'sign-up-mode' : ''}`}>
      <div className="forms-container">
        <div className="signin-signup">
          <Routes>
            <Route path="/" element={<Login onLogin={handleLogin} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onRegister={handleRegister} />} />
            <Route path="/userprofile" element={isLoggedIn ? <UserProfile /> : <Navigate to="/" />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/upload" element={<FileUploadForm user={{ country: 'INDIA', category: 'Health', subcategory: 'Lubricants' }} />} />
          </Routes>
        </div>
      </div>

      
        {/* <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>New here?</h3>
              <p>Embark on a journey of discovery and connection. 
                Create your account today and unlock a world of possibilities</p>
              <button
                className="btn transparent"
                id="sign-up-btn"
                onClick={() => {
                  setIsSignUpMode(true);
                  navigate('/register'); // Navigate to the Register route
                }}
              >
                Register
              </button>
            </div>
            <img src={logSvg} className="image" alt="" />
          </div>
          <div className="panel right-panel">
            <div className="content">
              <h3>One of us?</h3>
              <p>Welcome back! Enter your credentials to dive back into the wonders of our community. 
                Together, let's continue shaping the future</p>
              <button
                className="btn transparent"
                id="sign-in-btn"
                onClick={() => {
                  setIsSignUpMode(false);
                  navigate('/'); // Navigate to the Login route
                }}
              >
                Login
              </button>
            </div>
            <img src={registerSvg} className="image" alt="" />
          </div>
        </div>
    </div> */}
    </div>
  );
}

export default App;
