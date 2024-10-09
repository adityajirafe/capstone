# To run the backend server
```js
pip3 install -r requirements.txt
python File_Handler.py
```

Change `pip3` to `pip` if using python 2

# Backend details

The process flow for the file is as such:

File received from Scraper.tsx -> Sends to File_Handler.py to handle and upload file onto backend folder -> File then sent to Scraper_Script.py to acces OpenAI service to extract facts from sustainability report file -> Uploads a finished template file back to File_Handler.py -> Scraper.tsx awaits File_Handler's csv file which is automatically downloaded

TODOs

1) Update host server for backend to any actual backend service that we may use (now currently loaded on localhost:5000)
2) Create a designated storage area for files to be stored rather than storing it in the output file; possible connect to another backend service
3) Display output csv results as a table for users to see extracted facts. 

