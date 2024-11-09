import './Scraper.css'
import "../DataEntry.css";
import { Box, Button, Flex, Input, Text, useColorMode } from '@chakra-ui/react';
import React, { useState, useEffect} from 'react';
import DragDropUpload from '../../../components/DragDropUpload';
import CloudUpload from '../../../assets/CloudUpload.svg?react';
import FileIcon from '../../../assets/FileIcon.svg?react';
import Success from '../../../assets/Success.svg?react';
import Fail from '../../../assets/Fail.svg?react';
import Pending from '../../../assets/Pending.svg?react';
import { FileUploadStatus, InitiationMethod} from '../../../constants/types';

interface ScraperProps {
    scraperStatus: FileUploadStatus;
    setScraperStatus: (status: FileUploadStatus) => void;
    companyName: string | null;
    setCompanyName: (name: string | null) => void;
    taskID: string | null;
    setTaskID: (id: string | null) => void;
    inputMethod: InitiationMethod;

}



const Scraper = (props: ScraperProps) => {
    const { scraperStatus, setScraperStatus, setCompanyName, setTaskID, taskID, inputMethod } = props;
    
    const { colorMode } = useColorMode();

    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string | null>(null); // New state for the custom file name
    const [readyToUpload, setReadyToUpload] = useState<boolean>(false);
    const [message, SetMessage] = useState<string | null>(null); //Message to write on screen
    const [messageStatus, setMessageStatus] =  useState<string | null>(null);

    const pollTime = 15000; // 15s
    const pollTimeout = 900000; // 15min

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
            setMessageStatus(null); // Clear any previous errors
        } else {
            setMessageStatus('Error'); 
            SetMessage('Please select a valid PDF file.');
        }
    };

    const handleFileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFileName(event.target.value); // Update the state with the custom file name input
        setCompanyName(event.target.value) // used for subsequent pages
    };


     // Function to poll the status of the background task from the backend
     const pollTaskStatus = async () => {
            console.log('poll status runs')
            try {
                const storedTaskID = localStorage.getItem('taskID');
                // setTaskID(storedTaskID)
                const storedFileName = localStorage.getItem('filename');
                setFileName(storedFileName)
                setCompanyName(storedFileName)
                if (storedTaskID !== null) {
                    const interval = setInterval(async () => {
                        try {
                            console.log('polling')  
                            const response = await fetch(`https://shay.pythonanywhere.com/task-status/${storedTaskID}`);
                            const data = await response.json();
                            // If task is completed, download the result
                            if (data.status === 'Completed') {
                                //setLoading(false)
                                setScraperStatus("Completed")
                                if (storedTaskID !== null && storedFileName !== null) {
                                    //downloadCSV(storedTaskID, storedFileName) ; // Call the function to download the file
                                    setMessageStatus('Success')
                                    SetMessage('File processed. Please move on to the next step.')
                                } else {
                                    setScraperStatus("Failed")
                                    setMessageStatus('Error')
                                    SetMessage('Error occured with scraper task.')
                                    console.log('TaskID/FileName is null')
                                }
                                localStorage.setItem('taskIDScraped', storedTaskID);
                                localStorage.setItem('filenameScraped', storedFileName ?? "");
                                localStorage.removeItem('taskID');
                                localStorage.removeItem('filename');
                            } else if (data.status === 'In Progress') {
                                setMessageStatus('Loading')
                                setScraperStatus('In Progress')
                            } else if (data.status === 'Unknown Task ID' || data.status === 'Failed' ) {
                                setScraperStatus('Failed')
                                localStorage.removeItem('taskID');
                                localStorage.removeItem('filename');
                                setMessageStatus('Error')
                                SetMessage(`Scraping status: ${data.status}`)
                            }
                        } catch {
                            //console.error('Error fetching task status:', error);
                            setScraperStatus('Failed')

                            setMessageStatus('Error')
                            SetMessage(`Error fetching task status`)
                        }
                    }, pollTime); // Poll every 15 seconds
                    const timeout = setTimeout(async () => {
                        clearInterval(interval)
                        localStorage.removeItem('taskID');
                        localStorage.removeItem('filename');
                        console.log('timed out')
                        setMessageStatus('Error')
                        SetMessage(`Response timed out. Please refresh the page.`)
                        setScraperStatus("Failed") 
                    }, pollTimeout); // set timeout for 900000ms / 15 mins 
            
                    // Cleanup function to clear the interval when the component unmounts or taskID changes
                    return () => {
                        //clearInterval(interval);
                        clearTimeout(timeout);  
                    } 
                }
            } catch {
                console.log('error')
            } finally {
                //console.log('exited poll attempt')
            }
    };

    const handleUpload = async () => {
        setReadyToUpload(true)
        if (!file) {
            //setError('No file selected');
            setMessageStatus('Error')
            SetMessage(`No file selected.`)
            return;
        }

        if (!fileName?.trim()) {
            //setError('Please enter a valid name for the output file.');
            setMessageStatus('Error')
            SetMessage(`Please enter a valid name for the output file.`)
            return;
        }
        const tempTaskID = Date.now().toString()
        setTaskID(tempTaskID) //create unique ID
        setScraperStatus('In Progress')
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('file_name', fileName ?? ""); // Send the custom file name as well
        formData.append('task_id',tempTaskID);
        localStorage.removeItem('taskID');
        localStorage.removeItem('filename');
        localStorage.setItem('taskID', tempTaskID ?? '0');
        localStorage.setItem('filename', fileName);
        //setLoading(true) //start loading screen
        setMessageStatus('Loading')

        try {                
            const response = await fetch('https://shay.pythonanywhere.com/upload', {
                method: 'POST',
                body: formData,
            });


            if (response.ok) {
                //pollTaskStatus(); // Start polling for task status
                //console.log(tempTaskID)
            } else {
                const errorData = await response.json();
                setMessageStatus('Error')
                SetMessage(`Upload failed: ${errorData.error}`)
                setScraperStatus("Failed")
            }
        } catch (error) {
            console.error('Error:', error);
            setMessageStatus("Error")
            SetMessage(`An unexpected error occurred. Unable to connect with backend server.`)
            setScraperStatus("Failed")
        }
    };

    // Code to download the CSV at the end of scrape
    // const downloadCSV = async (storedTaskID: string, storedFileName: string) => {
    //     try {
    //         const response = await fetch(`https://shay.pythonanywhere.com/download/${storedTaskID}`);
    //         if (response.ok) {
    //             const blob = await response.blob();
    //             const url = window.URL.createObjectURL(blob);
    //             const a = document.createElement('a');
    //             a.href = url;
    //             a.download = `${storedFileName}.csv`;  // Use the custom file name for download
    //             a.click();
    //             window.URL.revokeObjectURL(url);
    //             setMessage('File processed and downloaded successfully!');
    //             setLoading(false)
    //         } else {
    //             setError('Failed to download the file.');
    //             console.error('Error:', error);
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //         setMessage('An unexpected error occurred while downloading.');
    //     }
    // };

    useEffect(() => { // polls for the task status continuously
        pollTaskStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [taskID]);

    if (inputMethod == InitiationMethod.manual) {
        return (
            <Box className="form-page">
                <div className='form-container'>
                    <div className='form-title-container'>
                        <Box className="form-logo-container" bg="monochrome">
                            <CloudUpload className={`form-icon-${colorMode}`} />
                        </Box>
                        <div className="form-text-container">
                            <Text fontSize={24} fontWeight={500}>Company Name</Text>
                            <Text fontSize={20} fontWeight={500} color="primary">Set your Company Name</Text>
                        </div>
                    </div>
                    <Box className='company-input-name' height="100%" mb="80px">
                        <Input
                            id="companyName"
                            type="text"
                            placeholder="Enter your company name"
                            onChange={handleFileNameChange} // Update the company name in the parent component
                        />
                    </Box>
                </div>
            </Box>
        )
    }

    return (
        <Box className="form-page">
            <div className='form-container'>
                <div className='form-title-container'>
                    <Box className="form-logo-container" bg="monochrome">
                        <CloudUpload className={`form-icon-${colorMode}`} />
                    </Box>
                    <div className="form-text-container">
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
                        <Button onClick={handleUpload} width="100px">Upload</Button>
                    </div>
                )}
                {fileName && readyToUpload && (
                    <div className='file-container'>
                        <Box className='file-item' bg={colorMode == "dark" ? "monochrome" : "lightGrey"}>
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
                <Flex>
                    {messageStatus == "Loading" && (
                        <p>Scraping file, please wait...</p>  // Show loading message while fetching
                    )}
                    {messageStatus == "Success" && (
                        <p style={{ color: 'green' }}>{message}</p> // Success message 
                    )}
                    {messageStatus == "Error" && (
                        <p style={{ color: 'red' }}>{message}</p> // Show error message
                    )}
                </Flex>
            </div>
        </Box>
    );
};

export default Scraper;
