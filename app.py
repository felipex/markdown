import os
import re
from flask import Flask, render_template, request, jsonify, redirect, url_for
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
USERNAME_REGEX = re.compile(r'^[a-zA-Z0-9_-]+$')

def get_user_dir(username):
    """Returns the absolute path to the user's directory, creating it if it doesn't exist."""
    if not USERNAME_REGEX.match(username):
        return None
    
    user_dir = os.path.join(BASE_DIR, f"bd_{username}")
    if not os.path.exists(user_dir):
        os.makedirs(user_dir)
    return user_dir

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/editor/<username>')
def editor(username):
    if not USERNAME_REGEX.match(username):
        return "Username inválido", 400
    
    # Ensure user dir exists
    get_user_dir(username)
    return render_template('editor.html', username=username)

@app.route('/api/files/<username>')
def list_files(username):
    user_path = get_user_dir(username)
    if not user_path:
        return jsonify({"error": "Invalid username"}), 400
    
    files = [f for f in os.listdir(user_path) if f.endswith('.md')]
    return jsonify({"files": files})

@app.route('/api/file/<username>/<filename>')
def get_file(username, filename):
    user_path = get_user_dir(username)
    if not user_path:
        return jsonify({"error": "Invalid username"}), 400
    
    filename = secure_filename(filename)
    if not filename.endswith('.md'):
        filename += '.md'
        
    file_path = os.path.join(user_path, filename)
    
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    return jsonify({"filename": filename, "content": content})

@app.route('/api/save/<username>/<filename>', methods=['POST'])
def save_file(username, filename):
    user_path = get_user_dir(username)
    if not user_path:
        return jsonify({"error": "Invalid username"}), 400
    
    filename = secure_filename(filename)
    if not filename.endswith('.md'):
        filename += '.md'
        
    data = request.get_json()
    content = data.get('content', '')
    
    if not filename or filename == '.md':
        return jsonify({"error": "Filename cannot be empty"}), 400

    file_path = os.path.join(user_path, filename)
    
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return jsonify({"message": "Arquivo salvo com sucesso", "filename": filename})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)