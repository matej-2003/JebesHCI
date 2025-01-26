from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
import requests

app = Flask(__name__)

# Configure the database (SQLite for simplicity)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///parking.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Create the database tables
with app.app_context():
    print("Creating database tables...")
    db.create_all()
    print("Tables created successfully!")

from ParkingFinder import routes

# Function to fetch parking data from OpenStreetMap (or any other source)
# def fetch_parking_data():
# 	# Overpass API query for parking spots in Koper, Slovenia
# 	overpass_url = "https://overpass-api.de/api/interpreter"
# 	query = """
# 	[out:json][timeout:25];
# 	(
# 		node["amenity"="parking"](45.525,13.700,45.570,13.760);
# 		way["amenity"="parking"](45.525,13.700,45.570,13.760);
# 		relation["amenity"="parking"](45.525,13.700,45.570,13.760);
# 	);
# 	out body;
# 	>;
# 	out skel qt;
# 	"""
# 	print("fetch parking data")
# 	response = requests.post(overpass_url, data=query)
# 	if response.status_code == 200:
# 		return response.json()
# 	else:
# 		return None

