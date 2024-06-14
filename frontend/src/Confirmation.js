import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { country, marketplace, file } = location.state || {};
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    async function fetchConfirmationMessage() {
      try {
        const response = await fetch('http://127.0.0.1:5000/confirmation');
        const data = await response.json();
        setConfirmationMessage(data.message);
      } catch (error) {
        console.error('Error fetching confirmation message:', error);
      }
    }

    fetchConfirmationMessage();
  }, []);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        // Finding the maximum number of columns
        const maxColumns = Math.max(...json.map(row => row.length));
        // Filling empty cells to ensure each row has the same number of columns
        const paddedJson = json.map(row => {
          const diff = maxColumns - row.length;
          return [...row, ...Array(diff).fill('')];
        });
        setTableData(paddedJson);
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file]);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('country', country);
    formData.append('marketplace', marketplace);
    formData.append('file', file);

    try {
      const token = localStorage.getItem('jwtToken');

      const response = await fetch('http://127.0.0.1:5000/userprofile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('File uploaded successfully.');
        navigate('/upload'); // Navigate to the /upload route
      } else {
        setError(data.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="confirmation-mode">
      <h2>Confirm Upload</h2>
      <br />
      <p>{confirmationMessage}</p>
      {file && (
        <div>
          <h3>File Content:</h3>
          <table className="excel-like-table">
            <thead>
              <tr>
                {tableData[0]?.map((cell, index) => (
                  <th key={index}>{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} style={{ whiteSpace: 'pre' }}>{cell || "\u00A0"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button className="btn" onClick={handleUpload}>Upload</button>
      <button className="btn" onClick={() => navigate('/userprofile')}>Back</button>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
};

export default Confirmation;
