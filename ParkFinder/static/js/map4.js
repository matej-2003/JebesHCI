// Search functionality
const view_zoom = 16;
const searchInput = document.getElementById('search-input');
const suggestionsDiv = document.getElementById('suggestions');
const filterBtn = document.getElementById('filter-btn');
const lcationBtn = document.getElementById('current_location_btn');
let searchMarker = null;
const MIN_CHARS = 3;

// Map functionality
let defaultSearchTerm = "Koper, Slovenija";
let defaultSearchLat = 45.5481; // Default: Koper, Slovenia
let defaultSearchLon = 13.7302;
let searchTerm = defaultSearchTerm;
let searchLat = defaultSearchLat; // Default: Koper, Slovenia
let searchLon = defaultSearchLon;
const radius = 2000;

//search functionality
const MAP_API_URL = 'https://overpass-api.de/api/interpreter';

const map = L.map('map-container');
// .setView([searchLat, searchLon], view_zoom);
console.log('Map initialized:', map); // Check if this logs correctly


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '© OpenStreetMap contributors'
}).addTo(map);

const debounce = (func, timeout = 300) => {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => func.apply(this, args), timeout);
	};
};

async function searchLocations(query) {
	suggestionsDiv.innerHTML = '';

	if (query.length <= MIN_CHARS) return;

	try {
		const url = new URL('https://nominatim.openstreetmap.org/search');
		url.searchParams.append('q', query);
		url.searchParams.append('format', 'json');
		url.searchParams.append('countrycodes', 'si');
		url.searchParams.append('limit', '5');

		const response = await fetch(url);
		const data = await response.json();

		if (data.length > 0) {
			suggestionsDiv.innerHTML = data.map(result => `
				<div class="suggestion-item" data-lat="${result.lat}" data-lon="${result.lon}">
					<strong>${result.display_name}</strong><br>
					<small>Type: ${result.type} (${result.class})</small>
				</div>
			`).join('');
		} else {
			suggestionsDiv.innerHTML = '<div class="suggestion-item">No results found</div>';
		}
	} catch (error) {
		console.error('Error:', error);
		suggestionsDiv.innerHTML = '<div class="suggestion-item">Error fetching results</div>';
	}
}

function buildOverpassQuery(fee, longitude, latitude) {
	return `[out:json][timeout:25];
		(
			node["amenity"="parking"]${fee !== 'no_filter' ? `["fee"="${fee}"]` : ''}(around:${radius},${latitude},${longitude});
			way["amenity"="parking"]${fee !== 'no_filter' ? `["fee"="${fee}"]` : ''}(around:${radius},${latitude},${longitude});
			relation["amenity"="parking"]${fee !== 'no_filter' ? `["fee"="${fee}"]` : ''}(around:${radius},${latitude},${longitude});
		);
		out geom;`;
}

function fetchParkingData(longitude = defaultSearchLon, latitude = defaultSearchLat) {
	const feeValue = document.querySelector('input[name="fee"]:checked').value;
	const query = buildOverpassQuery(feeValue, longitude, latitude);

	fetch(MAP_API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: 'data=' + encodeURIComponent(query)
	})
		.then(response => response.json())
		.then(data => {
			map.eachLayer(layer => {
				if (layer instanceof L.GeoJSON) {
					map.removeLayer(layer);
				}
			});

			const geojsonData = overpassToGeoJSON(data);
			console.log(data);

			L.geoJSON(geojsonData, {
				style: function (feature) {
					switch (feature.properties.fee) {
						case 'yes': return { color: '#f00', fillOpacity: 0.5 };
						case 'no': return { color: '#00f', fillOpacity: 0.5 };
						default: return { color: '#666', fillOpacity: 0.5 };
					}
				},
				onEachFeature: (feature, layer) => {
					const props = feature.properties;
					let url = `/parking_lot/${props.osmId}`;
					let [parkLon, parkLat] = [0, 0];
					let fake_info = generateParkingInfo(parseInt(props.osmId));
					fake_info.name = props.name;
					let fake_info_html = displayParkingInfo(fake_info, false);

					try {
						[parkLon, parkLat] = feature.geometry.coordinates[0][0];
					} catch (error) {
						console.log(feature);
					}
					let google_nav_link = `https://www.google.com/maps/dir/Current+Location/${parkLat},${parkLon}`;

					fake_info_html += `
						<a href="${url}"><button class="mdl-button mdl-js-button mdl-button--raised">
						Datails
						</button>&nbsp&nbsp&nbsp&nbsp</a>
						<a href="${google_nav_link}"><button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored">
						Directions
						</button></a></ul></div>`;
					layer.bindPopup(fake_info_html);
				}
			}).addTo(map);
		});
}

// Function to save search term, latitude, and longitude to local storage
function saveSearchToLocalStorage(searchTerm) {
	let searches = JSON.parse(localStorage.getItem('searchHistory')) || [];

	// Create a new search entry with timestamp and coordinates
	const newSearch = {
		term: searchTerm,
		lat: searchLat,
		lon: searchLon,
		timestamp: new Date().toISOString()
	};

	// Push the new search to the search history array
	searches.push(newSearch);
	localStorage.setItem('searchHistory', JSON.stringify(searches));  // Save to local storage

	// Store the latest search term and coordinates separately for map.html
	localStorage.setItem('currentSearch', JSON.stringify({
		term: searchTerm,
		lat: searchLat,
		lon: searchLon
	}));
}

// Event Listeners
filterBtn.addEventListener('click', () => {
	fetchParkingData(searchLon, searchLat);
	dialog.close();
});


lcationBtn.addEventListener('click', () => {
	fetchParkingData();
	map.setView([defaultSearchLat, defaultSearchLon], view_zoom);
});

searchInput.addEventListener('input', debounce(e => {
	const searchTerm = e.target.value.trim();
	searchLocations(searchTerm);
}));

// Modify the event listener for search suggestion selection to save the search
suggestionsDiv.addEventListener('click', e => {
	const item = e.target.closest('.suggestion-item');
	if (item) {
		const searchTerm = item.querySelector("strong").textContent;
		searchInput.value = searchTerm;
		suggestionsDiv.innerHTML = "";
		searchLat = parseFloat(item.dataset.lat);
		searchLon = parseFloat(item.dataset.lon);

		// Save the search term to local storage
		saveSearchToLocalStorage(searchTerm);

		// Clear existing markers from the map
		if (searchMarker) {
			map.removeLayer(searchMarker); // Remove the previous searchMarker
		}

		// Add a new marker at the selected location
		searchMarker = L.marker([searchLat, searchLon]).addTo(map);
		// Update the map view and fetch parking data
		fetchParkingData(searchLon, searchLat);
		map.setView([searchLat, searchLon], view_zoom);

	}
});
