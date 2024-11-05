from flask import Flask, request, jsonify, send_file
import os
import threading
import subprocess
from dotenv import load_dotenv
from flask_cors import CORS  # Import CORS to prevent cross origin routing (error provided as flask server is not the same as react server)
from supabase import create_client, Client
import jwt
import datetime
import uuid
import git

#Load environment variables from .env file
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv('FLASK_SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('FLASK_SUPABASE_ANON_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
from flask_cors import CORS  # Import CORS to prevent cross origin routing (error provided as flask server is not the same as react server)

#Generate JWT token
connectedAppClientId =  os.getenv('JWT_CONNECTED_APP_CLIENT_ID')
connectedAppSecretKey = os.getenv('JWT_CONNECTED_APP_SECRET_KEY')
connectedAppSecretId = os.getenv('JWT_CONNECTED_APP_SECRET_ID')
user = os.getenv('JWT_USER')

app = Flask(__name__)
CORS(app)

def run_scraper(task_id, file_name, output_file, file_path):
    """Function to run the long task (calling scraper.py) in the background."""
    
    try:
        process = subprocess.Popen(
            ['python', 'Scraper_Script.py', file_name, output_file, file_path, task_id],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = process.communicate()

        if process.returncode != 0:
            print('Failed Task')
            data = {
                'status': 'Failed',
                'updated_at': 'now()'
            }
            response = supabase.table('scraper_task_queue').update(data).eq('task_id', task_id).execute()
            if response:
                print('Error', stderr)
        else:
            print('Completed Task')
            data = {
                'status': 'Completed',
                'updated_at': 'now()'
            }
            response = supabase.table('scraper_task_queue').update(data).eq('task_id', task_id).execute()
            
    except Exception as e:
        print('Failed Task')
        data = {
            'status': 'Failed',
            'updated_at': 'now()'
        }
        response = supabase.table('scraper_task_queue').update(data).eq('task_id', task_id).execute()
        if response:
            print('error', e)
 
@app.route('/webhook', methods = ['POST'])
def webhook():
    if request.method == 'POST':
        repo = git.Repo('./myproject')
        origin = repo.remotes.origin
        repo.create_head('master', 
    origin.refs.master).set_tracking_branch(origin.refs.master).checkout()
        origin.pull()
        return 'Updated PythonAnywhere successfully', 200
    else:
        return 'Wrong event type', 400               
           
           
            
@app.route('/generate', methods = ['GET'])
def generate_token():
    token = jwt.encode(
        {
            "iss": connectedAppClientId,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=9),
            "jti": str(uuid.uuid4()),
            "aud": "tableau",
            "sub": user,
            "scp": ["tableau:views:embed"],
        },
        connectedAppSecretKey,
        algorithm="HS256",
        headers={
            "kid": connectedAppSecretId,
            "iss": connectedAppClientId,
        },
    )
    return jsonify({'token': token}), 202

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
    #task_id = str(int(time.time()))
    task_id = request.form.get('task_id', '0')

    # Start the scraper task in a background thread
    thread = threading.Thread(target=run_scraper, args=(task_id, file_name, output_file, file_path))
    thread.start()
    
    # Update Supabase task queue
    data = {
        'company_name' : file_name,
        'file_name' : file_name,
        'task_id': task_id,
        'status': 'In Progress'
    }
    response = supabase.table('scraper_task_queue').insert(data).execute()

    if response:
        return jsonify({'message': 'File uploaded successfully', 'task_id': task_id}), 202
    else:
        return jsonify({'error': 'Failed to add task'}), 500

@app.route('/task-status/<task_id>', methods=['GET'])
def task_status(task_id):
    """Check the status of the background task."""

    response = supabase.table('scraper_task_queue').select('status').eq('task_id', task_id).execute()
    if response:
        task_status = response.data[0]['status']
        return jsonify({'status': task_status}), 200
    else:
        return jsonify({'status': 'Unknown Task ID'}), 404
    
@app.route('/download/<task_id>', methods=['GET'])
def download_file(task_id):
    response = supabase.table('scraper_task_queue').select('file_name').eq('task_id', task_id).execute()
    filename = response.data[0]['file_name'] + '.csv'
    """Download the output CSV file once the task is completed."""
    file_path = os.path.join(OUTPUT_FOLDER, filename)

    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    else:
        return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    app.run(debug = True, port=5000)
