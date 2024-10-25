import React, { useState, useEffect} from 'react';

const Scraper: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>(''); // New state for the custom file name
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false) // State to record whether data is loading
    const [progress, setProgress] = useState<number>(0); // State of api scrape // UNUSED
    const [taskID, setTaskID] = useState<string | null>(null); // State to track task ID // FOr debugging purposes

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
     const pollTaskStatus = async () => {
            try {
                console.log('polling')
                const storedTaskID = localStorage.getItem('taskID');
                const storedFileName = localStorage.getItem('filename');
                if (storedTaskID !== null) {
                    setLoading(true)
                    const interval = setInterval(async () => {
                        try {
                            const response = await fetch(`http://localhost:5000/task-status/${storedTaskID}`);
                            const data = await response.json();
                            //console.log(storedTaskID)
                            // If task is completed, download the result
                            if (data.status === 'Completed') {
                                clearInterval(interval);
                                setProgress(100);
                                if (storedTaskID !== null && storedFileName !== null) {
                                    downloadCSV(storedTaskID, storedFileName) ; // Call the function to download the file
                                    setMessage('File processed and downloaded successfully!');
                                } else {
                                    setMessage("Error occured with File Download")
                                    console.log('TaskID/FileName is null')
                                }
                                localStorage.removeItem('taskID');
                                localStorage.removeItem('filename');
                            } else if (data.status === 'In Progress') {
                                setLoading(true) //start loading screen
                                setProgress(50); // Update progress (simple 50% during progress)
                            } else if (data.status === 'Unknown Task ID') {
                                clearInterval(interval);
                                setError(`Task failed: ${data.status}`);
                                console.log('TaskID missing in Backend')
                            }
                        } catch (error) {
                            //console.error('Error fetching task status:', error);
                            clearInterval(interval);
                            setError('Error fetching task status.');
                        }
                    }, 3000); // Poll every 3 seconds
                    const timeout = setTimeout(async () => {
                        clearInterval(interval)
                        localStorage.removeItem('taskID');
                        localStorage.removeItem('filename');
                        console.log('timed out')
                        setError('Response timed out.');
                        setLoading(false)
                    }, 900000); // set timeout for 900000ms / 15 mins 

            
                    // Cleanup function to clear the interval when the component unmounts or taskID changes
                    return () => {
                        clearInterval(interval);
                        clearTimeout(timeout)  
                    } 
                }
            } catch {
                setLoading(false)
            }
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


            if (response.ok) {
                const result = await response.json()
                setTaskID(result.task_id)
                localStorage.removeItem('taskID');
                localStorage.removeItem('filename');
                localStorage.setItem('taskID', result.task_id);
                localStorage.setItem('filename', fileName);
                    
                setMessage('File uploaded successfully. Processing started...');
                pollTaskStatus(); // Start polling for task status
                console.log(taskID)


            } else {
                const errorData = await response.json();
                setError(`Upload failed: ${errorData.error}`);
                setLoading(false)
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false) //reset loading
        }
    };

    const downloadCSV = async (storedTaskID: string, storedFileName: string) => {
        try {
            const response = await fetch(`http://localhost:5000/download/${storedTaskID}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${storedFileName}.csv`;  // Use the custom file name for download
                a.click();
                window.URL.revokeObjectURL(url);
                setMessage('File processed and downloaded successfully!');
                setLoading(false)
            } else {
                setError('Failed to download the file.');
                console.error('Error:', error);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('An unexpected error occurred while downloading.');
        }
    };

    useEffect(() => { // polls for the task status continuously
        pollTaskStatus();
    }, []);
    

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
                    <p>Loading data, please wait...</p>  // Show loading message while fetching
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p> // Show error message if the fetch fails
                ) : (
                    <p style={{ color: 'green' }}>{message}</p>
                )}
            </div>
        </div>
    );
};

// Progress bar component // UNUSED
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
