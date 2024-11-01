import './Scraper.css'
import "../DataEntry.css";
import { Box, Button, Input, Text, useColorMode } from '@chakra-ui/react';
import React, { useState, useEffect} from 'react';
import DragDropUpload from '../../../components/DragDropUpload';
import CloudUpload from '../../../assets/CloudUpload.svg?react';
import FileIcon from '../../../assets/FileIcon.svg?react';
import Success from '../../../assets/Success.svg?react';
import Fail from '../../../assets/Fail.svg?react';
import Pending from '../../../assets/Pending.svg?react';
import { FileUploadStatus } from '../../../constants/types';

interface ScraperProps {
    scraperStatus: FileUploadStatus;
    setScraperStatus: (status: FileUploadStatus) => void;
}

const Scraper = (props: ScraperProps) => {
    const { scraperStatus, setScraperStatus } = props;
    const { colorMode } = useColorMode()
    
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string | null>(null); // New state for the custom file name
    const [readyToUpload, setReadyToUpload] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false) // State to record whether data is loading
    const [taskID, setTaskID] = useState<string | null>(null); // State to track task ID // FOr debugging purposes

    const formatFileSize = (size : number | undefined) => {
        if (!size) return
        return size < 1024
            ? `${size} bytes`
            : size < 1024 * 1024
            ? `${(size / 1024).toFixed(2)} KB`
            : `${(size / (1024 * 1024)).toFixed(2)} MB`;
    };

    const handleFileChange = (file: File | null) => {
        setReadyToUpload(false)
        const selectedFile = file
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
                setTaskID(storedTaskID)
                const storedFileName = localStorage.getItem('filename');
                setFileName(storedFileName)
                if (storedTaskID !== null) {
                    setLoading(true)
                    const interval = setInterval(async () => {
                        try {
                            const response = await fetch(`http://localhost:5000/task-status/${storedTaskID}`);
                            const data = await response.json();
                            //console.log(storedTaskID)
                            // If task is completed, download the result
                            if (data.status === 'Completed') {
                                setScraperStatus("Completed")
                                clearInterval(interval);
                                if (storedTaskID !== null && storedFileName !== null) {
                                    downloadCSV(storedTaskID, storedFileName) ; // Call the function to download the file
                                    setMessage('File processed and downloaded successfully!');
                                } else {
                                    setScraperStatus("Failed")
                                    setMessage("Error occured with File Download")
                                    console.log('TaskID/FileName is null')
                                }
                                localStorage.removeItem('taskID');
                                localStorage.removeItem('filename');
                            } else if (data.status === 'In Progress') {
                                setScraperStatus('In Progress')
                                setLoading(true) //start loading screen
                            } else if (data.status === 'Unknown Task ID') {
                                setScraperStatus('Failed')
                                clearInterval(interval);
                                setError(`Task failed: ${data.status}`);
                                console.log('TaskID missing in Backend')
                            }
                        } catch {
                            //console.error('Error fetching task status:', error);
                            setScraperStatus('Failed')
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
                        setScraperStatus("Failed")
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
        setReadyToUpload(true)
        if (!file) {
            setError('No file selected');
            return;
        }

        if (!fileName?.trim()) {
            setError('Please enter a valid name for the output file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('file_name', fileName ?? ""); // Send the custom file name as well
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
                setScraperStatus("Failed")
                setLoading(false)
            }
        } catch (error) {
            console.error('Error:', error);
            setScraperStatus("Failed")
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Box className="form-page">
            <div className='scraper-container'>
                <div className='scraper-title-container'>
                    <Box className="scraper-logo-container" bg="monochrome">
                        <CloudUpload className={`scraper-cloud-${colorMode}`} />
                    </Box>
                    <div className="scraper-options-text-container">
                        <Text fontSize={24} fontWeight={500}>Upload File</Text>
                        <Text fontSize={20} fontWeight={500} color="primary">Select and upload files of your choice</Text>
                    </div>
                </div>
                <DragDropUpload file={file} handleFileChange={handleFileChange} />
                {file && !readyToUpload && (
                    <div className='company-input-name'>
                        <Input
                            id="companyName"
                            type="text"
                            placeholder="Enter your company name"
                            onChange={handleFileNameChange} // Update the company name in the parent component
                        />
                        <Button onClick={handleUpload}>Upload</Button>
                    </div>
                )}
                {fileName && readyToUpload && (
                    <div className='file-container'>
                        <Box className='file-item' bg="lightGrey">
                            <FileIcon className='file-icon' />
                            <div className='file-item-text-container'>
                                <Text fontSize="16px">{file?.name}</Text>
                                <div className='file-item-subtext'>
                                    <Text fontSize="12px" color="primary" fontWeight={500}>{formatFileSize(file?.size)}</Text>
                                    {scraperStatus == "Completed" && (
                                        <div className='file-status-container'>
                                            <Success className='file-item-status-icon' />
                                            <Text fontSize="12px" fontWeight="500" color="green">{scraperStatus}</Text>
                                        </div>
                                    )}
                                    {scraperStatus == "In Progress" && (
                                        <div className='file-status-container'>
                                            <Pending className='file-item-status-icon' />
                                            <Text fontSize="12px" fontWeight="500" color="orange">{scraperStatus}</Text>
                                        </div>
                                    )}
                                    {scraperStatus == "Failed" && (
                                        <div className='file-status-container'>
                                            <Fail className='file-item-status-icon' />
                                            <Text fontSize="12px" fontWeight="500" color="red">{scraperStatus}</Text>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Box>
                    </div>
                )}
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
        </Box>
    );
};

export default Scraper;
