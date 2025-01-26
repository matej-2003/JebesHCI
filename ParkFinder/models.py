from flask_sqlalchemy import SQLAlchemy
from ParkingFinder import db

class ParkingSpot(db.Model):
	__tablename__ = 'parking_spot'
	id = db.Column(db.BigInteger, primary_key=True)  # Node ID
	lat = db.Column(db.Float, nullable=False)  # Latitude
	lon = db.Column(db.Float, nullable=False)  # Longitude
	parking_lot_id = db.Column(db.BigInteger, db.ForeignKey('parking_lot.id'))  # Foreign key to ParkingLot
	tags = db.relationship('Tag', backref='parking_spot', lazy=True)  # Tags for the parking spot

class ParkingLot(db.Model):
	__tablename__ = 'parking_lot'
	id = db.Column(db.BigInteger, primary_key=True)  # Way ID
	name = db.Column(db.String(100), nullable=True)  # Optional name for the parking lot
	tags = db.relationship('Tag', backref='parking_lot', lazy=True)  # Tags for the parking lot
	parking_spots = db.relationship('ParkingSpot', backref='parking_lot', lazy=True)  # Parking spots in the lot

class Tag(db.Model):
	__tablename__ = 'tag'
	id = db.Column(db.Integer, primary_key=True)
	key = db.Column(db.String(50), nullable=False)  # Tag key (e.g., "amenity", "capacity")
	value = db.Column(db.String(200), nullable=False)  # Tag value (e.g., "parking", "50")
	parking_spot_id = db.Column(db.BigInteger, db.ForeignKey('parking_spot.id'), nullable=True)  # Foreign key to ParkingSpot
	parking_lot_id = db.Column(db.BigInteger, db.ForeignKey('parking_lot.id'), nullable=True)  # Foreign key to ParkingLot