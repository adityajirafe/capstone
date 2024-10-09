import React, { useState } from 'react';

const Scraper: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>(''); // New state for the custom file name
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false) // State to record whether data is loading
    const [progress, setProgress] = useState<number>(0); // State of api scrape


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError(null); // Clear any previous errors
        } else {
            setError('Please select a valid PDF file.');
        }
    };

    const handleFileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFileName(event.target.value); // Update the state with the custom file name input
    };

    // Function to poll the progress from the backend
    const pollProgress = async () => {
        const interval = setInterval(async () => {
        try {
            const response = await fetch('http://localhost:5000/progress');
            const data = await response.json();
            setProgress(data.progress);

            // Stop polling when progress reaches 100%
            if (data.progress >= 100) {
            clearInterval(interval);
            setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching progress:', error);
            clearInterval(interval);
            setLoading(false);
        }
        }, 1000); // Poll every 1 second
    };

    const handleUpload = async () => {
        if (!file) {
            setError('No file selected');
            return;
        }

        if (!fileName.trim()) {
            setError('Please enter a valid name for the output file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('file_name', fileName); // Send the custom file name as well
        setLoading(true) //start loading screen
        
        try {
            // TODO: update the fetch server to whatever backend service we want to use, currently using localhost for development 
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });
            pollProgress()
            console.log(response)

            if (response.ok) {
                // Handle the CSV file download
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${fileName}.csv`;  // Use the custom file name for download
                a.click();
                window.URL.revokeObjectURL(url);
                setMessage('File processed and downloaded successfully!');
            } else {
                const errorData = await response.json();
                setError(`Upload failed: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false) //reset loading
        }
    };

    return (
        <div>
            <h1>Upload PDF for Scraping</h1>
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
            <br />
            <button onClick={handleUpload}>Upload</button>
            <div>
                {loading ? (
                    <><p>Loading data, please wait...</p> 
                        <ProgressBar progress={progress} /></> // Show loading message while fetching
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p> // Show error message if the fetch fails
                ) : (
                    <p style={{ color: 'green' }}>{message}</p>
                )}
            </div>
            {/* {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>} */}
        </div>
    );
};

// Progress bar component
interface ProgressBarProps {
    progress: number;
  }
  
  const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    return (
      <div style={{ width: '100%', backgroundColor: '#e0e0de', borderRadius: '5px' }}>
        <div
          style={{
            width: `${progress}%`,
            height: '24px',
            backgroundColor: progress >= 100 ? 'green' : 'blue',
            borderRadius: '5px',
            textAlign: 'center',
            color: 'white',
          }}
        >
          {progress.toFixed(2)}%
        </div>
      </div>
    );
  };

export default Scraper;
