from flask import render_template, send_file, jsonify, request
from datetime import datetime
from ParkingFinder import app

# API endpoint to get parking data
@app.route('/parking/api')
def get_parking_data():
	# return send_file("export.geojson", "application/json")
	return send_file("parking_data.json", "application/json")

@app.route('/')
def map():
	return render_template('map.html')

@app.route('/reservations')
def reservations():
	return render_template('reservations.html')

@app.route('/parking_lot/<int:id>')
def parking_lot(id):
	return render_template('parking_lot.html', id=id)

@app.route('/history')
def history():
	# Example search data; replace with actual data retrieval logic
	searches = [
		{'term': 'Logatec', 'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')},
		{'term': 'Koper', 'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
	]
	return render_template('history.html', searches=searches)
