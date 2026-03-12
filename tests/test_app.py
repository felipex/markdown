import json

def test_index(client):
    """Test the index page."""
    response = client.get('/')
    assert response.status_code == 200
    assert b"Markdown Lite" in response.data

def test_editor_invalid_username(client):
    """Test editor with invalid username."""
    response = client.get('/editor/invalid@user')
    assert response.status_code == 400
    assert b"Username inv\xc3\xa1lido" in response.data

def test_list_files(client, clean_test_user):
    """Test listing files for a user."""
    username = clean_test_user
    # First request ensures directory creation
    client.get(f'/editor/{username}')
    
    response = client.get(f'/api/files/{username}')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "files" in data
    assert isinstance(data["files"], list)

def test_save_and_get_file(client, clean_test_user):
    """Test saving a file and then retrieving it."""
    username = clean_test_user
    filename = "test_note"
    content = "# Hello World\nThis is a test."
    
    # Save file
    response = client.post(
        f'/api/save/{username}/{filename}',
        data=json.dumps({"content": content}),
        content_type='application/json'
    )
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "message" in data
    assert data["filename"] == "test_note.md"
    
    # Get file
    response = client.get(f'/api/file/{username}/{filename}')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["filename"] == "test_note.md"
    assert data["content"] == content

def test_get_nonexistent_file(client, clean_test_user):
    """Test retrieving a file that doesn't exist."""
    username = clean_test_user
    response = client.get(f'/api/file/{username}/ghost')
    assert response.status_code == 404
    data = json.loads(response.data)
    assert "error" in data
