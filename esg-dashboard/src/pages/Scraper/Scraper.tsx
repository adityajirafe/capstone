import React, { useState } from "react";
import "./Scraper.css";

const Scraper: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>(""); // New state for the custom file name
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null); // Clear any previous errors
    } else {
      setError("Please select a valid PDF file.");
    }
  };

  const handleFileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.value); // Update the state with the custom file name input
  };

  const handleUpload = async () => {
    if (!file) {
      setError("No file selected");
      return;
    }

    if (!fileName.trim()) {
      setError("Please enter a valid name for the output file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_name", fileName); // Send the custom file name as well

    try {
      // TODO: update the fetch server to whatever backend service we want to use, currently using localhost for development
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      console.log(response);

      if (response.ok) {
        // Handle the CSV file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.csv`; // Use the custom file name for download
        a.click();
        window.URL.revokeObjectURL(url);
        setMessage("File processed and downloaded successfully!");
        setUploadedFiles([...uploadedFiles, file]);
      } else {
        const errorData = await response.json();
        setError(`Upload failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred.");
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const selectedFile = event.dataTransfer.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null); // Clear any previous errors
    } else {
      setError("Please select a valid PDF file.");
    }
  };

  return (
    <div className="scraper-container">
      <div className="header-section">
        <i className="upload-icon fas fa-upload" />
        <h1>Upload files</h1>
        <p>Select and upload files of your choice</p>
      </div>
      <div className="upload-section">
        <div
          className="drop-zone"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          Choose a file or drag & drop it here
        </div>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <br />
        <label htmlFor="fileName">Output File Name:</label>
        <input
          type="text"
          id="fileName"
          value={fileName}
          onChange={handleFileNameChange}
          placeholder="Enter output file name (without extension)"
        />
        <button onClick={handleUpload}>Upload</button>
      </div>
      <div className="uploaded-files-section">
        <h2>Uploaded Files:</h2>
        <ul>
          {uploadedFiles.map((file, index) => (
            <li key={index}>
              <span className="file-name">{file.name}</span>
              <span className="file-status">Uploaded successfully</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Scraper;
