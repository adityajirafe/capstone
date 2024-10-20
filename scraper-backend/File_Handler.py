from flask import Flask, request, jsonify, send_file
import os
import threading
import subprocess
from flask_cors import CORS  # Import CORS to prevent cross origin routing (error provided as flask server is not the same as react server)
import time

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
from flask_cors import CORS  # Import CORS to prevent cross origin routing (error provided as flask server is not the same as react server)

# Global variable to store task status
tasks = {}

def run_scraper(task_id, file_name, output_file, file_path):
    """Function to run the long task (calling scraper.py) in the background."""
    tasks[task_id] = 'In Progress'
    
    try:
        process = subprocess.Popen(
            ['python', 'Scraper_Script.py', file_name, output_file, file_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = process.communicate()

        if process.returncode != 0:
            tasks[task_id] = f"Failed: {stderr}"
        else:
            tasks[task_id] = 'Completed'
    except Exception as e:
        tasks[task_id] = f"Failed: {str(e)}"

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Retrieve the custom file name
    file_name = request.form.get('file_name', 'output')  # Default name is 'output'
    file_name = ''.join(c for c in file_name if c.isalnum() or c in (' ', '_', '-')).rstrip()

    # Save the uploaded file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    # Define the output file path
    output_file = os.path.join(OUTPUT_FOLDER, f'{file_name}.csv')

    # Create a unique task ID (can use something like UUID for uniqueness)
    task_id = str(int(time.time()))

    # Start the scraper task in a background thread
    thread = threading.Thread(target=run_scraper, args=(task_id, file_name, output_file, file_path))
    thread.start()

    # Initialize the task status as 'In Progress'
    tasks[task_id] = 'In Progress'

    return jsonify({'message': 'File uploaded successfully', 'task_id': task_id}), 202

@app.route('/task-status/<task_id>', methods=['GET'])
def task_status(task_id):
    """Check the status of the background task."""
    if task_id not in tasks:
        return jsonify({'status': 'Unknown Task ID'}), 404
    status = tasks[task_id]
    return jsonify({'status': status})

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    """Download the output CSV file once the task is completed."""
    file_path = os.path.join(OUTPUT_FOLDER, filename)

    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    else:
        return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    app.run(debug = True, port=5000)
