import React, { useState, useEffect} from 'react';

const Scraper: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>(''); // New state for the custom file name
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false) // State to record whether data is loading
    const [progress, setProgress] = useState<number>(0); // State of api scrape
    const [taskId, setTaskId] = useState<string | null>(null); // State to track task ID

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


     // Function to poll the status of the background task from the backend
     const pollTaskStatus = async (taskId: string) => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`http://localhost:5000/task-status/${taskId}`);
                const data = await response.json();
                
                // If task is completed, download the result
                if (data.status === 'Completed') {
                    clearInterval(interval);
                    setProgress(100);
                    downloadCSV(fileName); // Call the function to download the file
                    setMessage('File processed and downloaded successfully!');
                } else if (data.status === 'In Progress') {
                    setProgress(50); // Update progress (simple 50% during progress)
                } else if (data.status.startsWith('Failed')) {
                    clearInterval(interval);
                    setError(`Task failed: ${data.status}`);
                }
            } catch (error) {
                console.error('Error fetching task status:', error);
                clearInterval(interval);
                setError('Error fetching task status.');
            }
        }, 3000); // Poll every 3 seconds
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

            
            //console.log(response)

            if (response.ok) {
                // Handle the CSV file download
                const result = await response.json()
                setTaskId(result.task_id)
                localStorage.setItem('taskId', result.id);
                setMessage('File uploaded successfully. Processing started...');
                pollTaskStatus(result.task_id); // Start polling for task status
                console.log(taskId)


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

    const downloadCSV = async (fileName: string) => {
        try {
            const response = await fetch(`http://localhost:5000/download/${fileName}.csv`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${fileName}.csv`;  // Use the custom file name for download
                a.click();
                window.URL.revokeObjectURL(url);
                setMessage('File processed and downloaded successfully!');
            } else {
                setError('Failed to download the file.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('An unexpected error occurred while downloading.');
        }
    };

    useEffect(() => {
        try {
            const storedTaskId = localStorage.getItem('taskId');
            console.log('stored', storedTaskId)
            if (storedTaskId) {
                setLoading(true)
                const interval = setInterval(async () => {
                    try {
                        const response = await fetch(`http://localhost:5000/task-status/${storedTaskId}`);
                        const data = await response.json();
                        
                        // If task is completed, download the result
                        if (data.status === 'Completed') {
                            clearInterval(interval);
                            setProgress(100);
                            downloadCSV(fileName); // Call the function to download the file
                            setMessage('File processed and downloaded successfully!');
                        } else if (data.status === 'In Progress') {
                            setProgress(50); // Update progress (simple 50% during progress)
                        } else if (data.status.startsWith('Failed')) {
                            clearInterval(interval);
                            setError(`Task failed: ${data.status}`);
                        }
                    } catch (error) {
                        console.error('Error fetching task status:', error);
                        clearInterval(interval);
                        setError('Error fetching task status.');
                    }
                }, 3000); // Poll every 3 seconds
        
                // Cleanup function to clear the interval when the component unmounts or taskId changes
                return () => clearInterval(interval);  
            }
        } catch {
            setLoading(false)
        }
    }, [taskId, fileName]);
    

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
