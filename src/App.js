import React, { useState, useEffect } from 'react';
import './App.css';
import PDFReader from './components/FileReader';

function App() {
  const [savedFiles, setSavedFiles] = useState([]);
  const [currentFileIndex1, setCurrentFileIndex1] = useState(null);
  const [currentFileIndex2, setCurrentFileIndex2] = useState(null);

  useEffect(() => {
    localStorage.removeItem('savedFiles');
  }, []);

  useEffect(() => {
    const storedFiles = JSON.parse(localStorage.getItem('savedFiles')) || [];
    setSavedFiles(storedFiles);

    if (storedFiles.length > 0) {
      setCurrentFileIndex1(0);
      setCurrentFileIndex2(0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savedFiles', JSON.stringify(savedFiles));
  }, [savedFiles]);

  const handleFileChange = (newFile, viewerId) => {
    setSavedFiles((prevFiles) => [...prevFiles, newFile]);

    if (viewerId === 1) {
      setCurrentFileIndex1(savedFiles.length);
    } else if (viewerId === 2) {
      setCurrentFileIndex2(savedFiles.length);
    }
  };

  return (
    <div className="app">

      <h1 className="app-header">Gallery</h1>

      <div className="viewer-container">

        <div className="viewer-box">

          <PDFReader
            savedFiles={savedFiles}
            currentFileIndex={currentFileIndex1}
            setCurrentFileIndex={setCurrentFileIndex1}
            onFileChange={(newFile) => handleFileChange(newFile, 1)}
          />
        </div>

        <div className="viewer-box">

          <PDFReader

            savedFiles={savedFiles}
            currentFileIndex={currentFileIndex2}
            setCurrentFileIndex={setCurrentFileIndex2}
            onFileChange={(newFile) => handleFileChange(newFile, 2)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
