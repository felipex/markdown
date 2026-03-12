import pytest
import os
import shutil
from app import app as flask_app

@pytest.fixture
def app():
    # Configure app for testing
    flask_app.config.update({
        "TESTING": True,
    })
    
    # We might want to use a temporary directory for tests
    # instead of the real bd_* directories
    yield flask_app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()

@pytest.fixture
def clean_test_user():
    username = "tester"
    user_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", f"bd_{username}")
    
    # Clean up before test
    if os.path.exists(user_dir):
        shutil.rmtree(user_dir)
    
    yield username
    
    # Clean up after test
    if os.path.exists(user_dir):
        shutil.rmtree(user_dir)
