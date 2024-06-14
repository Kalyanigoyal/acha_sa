import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile = ({ token }) => {
  const [country, setCountry] = useState('');
  const [marketplace, setMarketplace] = useState('');
  const [file, setFile] = useState(null);
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/confirmation', { state: { country, marketplace, file } }); // Navigate to the confirmation route with state
  };

  return (
    <div>
      <style>
        {`
          .sign-up-form {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 300px;
            margin: auto;
          }

          .input-field {
            position: relative;
            margin: 10px 0;
            width: 100%;
          }

          .input-field i {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
          }

          .input-field select, .input-field input[type="file"] {
            width: 65vh;
            padding: 10px 10px 10px 30px;
            border: 1px solid #ccc;
            border-radius: 25px;
            outline: none;
          }

          .title {
            font-size: 2rem;
            margin-bottom: 20px;
          }

          .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 25px;
            background-color: #5cb85c;
            color: white;
            cursor: pointer;
          }

          .error {
            color: red;
            margin-top: 10px;
          }

          .success {
            color: green;
            margin-top: 10px;
          }
        `}
      </style>
      <div className="sign-up-form ">
        <h2 className="title">User Profile</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="input-field">
            <i className="fas fa-globe"></i>
            <select
              name="country"
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            >
              <option value="" disabled>Select Country</option>
              <option value="USA">USA</option>
              <option value="Canada">Canada</option>
              <option value="UK">UK</option>
              {/* Add more countries as needed */}
            </select>
          </div>
          <div className="input-field">
            <i className="fas fa-shopping-cart"></i>
            <select
              name="marketplace"
              id="marketplace"
              value={marketplace}
              onChange={(e) => setMarketplace(e.target.value)}
              required
            >
              <option value="" disabled>Select Marketplace</option>
              <option value="Amazon">Amazon</option>
              <option value="eBay">eBay</option>
              <option value="Walmart">Walmart</option>
              {/* Add more marketplaces as needed */}
            </select>
          </div>
          <div className="input-field">
            <i className="fas fa-file-upload"></i>
            <input type="file" name="file" id="file" onChange={handleFileChange} required />
          </div>
          <input type="submit" value="Next" className="btn solid" />
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
