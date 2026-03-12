VENV = venv
PYTHON = $(VENV)/bin/python
PIP = $(VENV)/bin/pip
GUNICORN = $(VENV)/bin/gunicorn
PYTEST = $(VENV)/bin/pytest

.PHONY: install run stop test clean help

help:
	@echo "Available commands:"
	@echo "  make install  - Install dependencies"
	@echo "  make run      - Run the app with gunicorn (daemon mode)"
	@echo "  make stop     - Stop the gunicorn server"
	@echo "  make test     - Run tests with pytest"
	@echo "  make clean    - Remove temporary files and cached directories"

install:
	$(PIP) install -r requirements.txt

run:
	$(GUNICORN) -c gunicorn.conf.py app:app --daemon

stop:
	pkill -f gunicorn || true

test:
	PYTHONPATH=. $(PYTEST) tests/

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	rm -rf bd_tester
	@echo "Cleanup complete."
