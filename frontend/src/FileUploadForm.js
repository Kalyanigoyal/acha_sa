import React, { useState, useEffect } from 'react';

const FileUploadForm = ({ user, token }) => {
  const [file, setFile] = useState(null);
  const [country, setCountry] = useState(user.country || '');
  const [category, setCategory] = useState(user.category || '');
  const [subcategory, setSubcategory] = useState(user.subcategory || '');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    updateCategories();
    updateSubcategories();
  }, [country, category]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleSubcategoryChange = (e) => {
    setSubcategory(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('country', country);
    formData.append('category', category);
    formData.append('subcategory', subcategory);
  
    const token = localStorage.getItem('jwtToken');
  
    fetch('http://127.0.0.1:5000/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    })
    .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      // Return the response directly if it's a file
      return response.blob();
  })
  .then(blob => {
      // Create a blob URL for the file and download it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'myoutput.xlsx'; // Set the filename here
      document.body.appendChild(a); // Append the link to the body
      a.click(); // Click the link to start the download
      a.remove(); // Remove the link after download
  })
  .catch(error => {
      console.error('There was a problem with the file download:', error);
  });
}
  const updateCategories = () => {
    let options = [];
    if (country === 'INDIA' || country === 'Canada') {
      options = ['Health', 'Beauty'];
    } else {
      options = ['Select Category'];
    }
    setCategories(options);
    setCategory(options.includes(category) ? category : '');
  };

  const updateSubcategories = () => {
    let options = [];
    if (category === 'Health') {
      options = ['Lubricants', 'Intimate Hygiene'];
    } else if (category === 'Beauty') {
      options = ['Shampoo', 'Soap'];
    } else {
      options = ['Select Subcategory'];
    }
    setSubcategories(options);
    setSubcategory(options.includes(subcategory) ? subcategory : '');
  };

  return (
    <div>
      <style>
        {`
          .upload-form {
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
            height: 55px;
    border-radius: 55px;
    display: grid;
    grid-template-columns: 25% 75%;
    padding: 0 0.4rem;
          }

          .input-field i {
            position: absolute;
            left: 15vh;
            top: 50%;
            transform: translateY(-50%);
          }

          .input-field select, .input-field input[type="file"] {
            width: 55vh;
            padding: 10px 10px 10px 30px;
            border: 1px solid #ccc;
            border-radius: 25px;
            outline: none;
          }

          .title {
            font-size: 2rem;
            margin-bottom: 20px;
          }
.input-field label {
  padding: 0.5rem; /* Padding for all labels */
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
      <div className="upload-form">
        <h2 className="title">Upload File</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="input-field">
            <i className="fas fa-file-upload"></i>
            <label htmlFor="file">File:</label>
            <input type="file" id="file" name="file" onChange={handleFileChange} required />
          </div>

          <div className="input-field">
            <i className="fas fa-globe"></i>
            <label htmlFor="country">Select country:</label>
            <select name="country" id="country" value={country} onChange={handleCountryChange} required>
              <option value="" >Select Country</option>
              <option value="INDIA">INDIA</option>
              <option value="Canada">Canada</option>
            </select>
          </div>

          <div className="input-field">
            <i className="fas fa-tag"></i>
            <label htmlFor="category">Select category:</label>
            <select name="category" id="category" value={category} onChange={handleCategoryChange} required>
              <option value="">Select Category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="input-field">
            <i className="fas fa-tags"></i>
            <label htmlFor="subcategory">Select subcategory:</label>
            <select name="subcategory" id="subcategory" value={subcategory} onChange={handleSubcategoryChange} required>
              <option value="">Select Subcategory</option>
              {subcategories.map((subcat, index) => (
                <option key={index} value={subcat}>{subcat}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn">Upload</button>
        </form>
      </div>
    </div>
  );
};

export default FileUploadForm;
