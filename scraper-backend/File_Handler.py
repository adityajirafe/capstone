from flask import Flask, request, jsonify, send_file
import os
import subprocess
from flask_cors import CORS  # Import CORS to prevent cross origin routing (error provided as flask server is not the same as react server)

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Retrieve the custom file name
    file_name = request.form.get('file_name', 'output')  # Default name is 'output'

    # Ensure the file name is safe (remove unwanted characters)
    file_name = ''.join(c for c in file_name if c.isalnum() or c in (' ', '_', '-')).rstrip()
    
    # Save the uploaded file
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    # Define the output Excel file path using the custom name
    output_file = os.path.join(OUTPUT_FOLDER, f'{file_name}.csv')

    # Run your Python script to process the PDF and create the CSV file
    try:
        # Call your script (you can modify this based on how your script works)
        subprocess.run(['python', 'Scraper_Script.py', file_name, output_file, file_path], check=True)

        # Send the generated CSV file back to the frontend
        return send_file(output_file, as_attachment=True, download_name=f'{file_name}.csv')

    except subprocess.CalledProcessError as e:
        return jsonify({'error': f'Error in processing PDF: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(port=5000)
