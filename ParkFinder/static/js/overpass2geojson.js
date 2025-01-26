function overpassToGeoJSON(data) {
	return {
		type: "FeatureCollection",
		features: data.elements.map(element => {
			let geometry = null;
			const properties = element.tags || {};

			// Add OSM metadata
			properties.osmType = element.type;
			properties.osmId = element.id;

			// Create geometry based on element type
			switch (element.type) {
				case 'node':
					geometry = {
						type: "Point",
						coordinates: [element.lon, element.lat]
					};
					break;

				case 'way':
					if (element.geometry) {
						geometry = {
							type: "LineString",
							coordinates: element.geometry.map(point => [point.lon, point.lat])
						};

						// Check if it's a closed polygon (first and last point are the same)
						if (element.geometry.length >= 4 &&
							element.geometry[0].lon === element.geometry[element.geometry.length - 1].lon &&
							element.geometry[0].lat === element.geometry[element.geometry.length - 1].lat) {
							geometry.type = "Polygon";
							geometry.coordinates = [geometry.coordinates]; // Polygon needs an array of coordinates
						}
					}
					break;

				case 'relation':
					// Handle multipolygons
					if (element.tags && element.tags.type === 'multipolygon' && element.members) {
						const outerWays = [];
						const innerWays = [];

						// Separate outer and inner ways
						element.members.forEach(member => {
							if (member.role === 'outer' && member.type === 'way') {
								outerWays.push(member);
							} else if (member.role === 'inner' && member.type === 'way') {
								innerWays.push(member);
							}
						});

						// Process outer ways
						const outerCoordinates = outerWays.map(way => {
							return way.geometry.map(point => [point.lon, point.lat]);
						});

						// Process inner ways
						const innerCoordinates = innerWays.map(way => {
							return way.geometry.map(point => [point.lon, point.lat]);
						});

						// Create GeoJSON multipolygon
						geometry = {
							type: "Polygon",
							coordinates: [...outerCoordinates, ...innerCoordinates]
						};
					}
					break;
			}

			return geometry ? {
				type: "Feature",
				geometry: geometry,
				properties: properties
			} : null;

		}).filter(feature => feature) // Remove invalid features
	};
}
