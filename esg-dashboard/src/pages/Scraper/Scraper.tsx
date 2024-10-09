import React, { useState } from 'react';

const Scraper: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>(''); // New state for the custom file name
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

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

        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });
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
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
        </div>
    );
};

export default Scraper;
