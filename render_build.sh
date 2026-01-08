#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r backend/requirements.txt

# Run migrations and collect static
cd backend
python manage.py collectstatic --no-input
python manage.py migrate
