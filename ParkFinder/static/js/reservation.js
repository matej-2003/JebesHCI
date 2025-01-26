
// Retrieve the reserved parking ID and reservation time from localStorage
const reservedParkingId = localStorage.getItem("reservedParkingId");
const reservationTime = localStorage.getItem("reservationTime"); // Time when the reservation was made

// Function to display parking info
function displayParkingInfo(parkingInfo) {
    return `
			<center class="res_title">Current reservation: <b>${parkingInfo.name}</b></center>
			<img class="spot" src="{{ url_for('static', filename='spot.jpg') }}" alt="">
			<ul>
				<li><strong>Type:</strong> ${parkingInfo.type}</li>
				<li><strong>Fee:</strong> ${parkingInfo.fee}</li>
				<li><strong>Capacity:</strong>${parkingInfo.capacity.total} spots</li>
				<li><strong>Access:</strong> ${parkingInfo.access}</li>
				<li><strong>Opening Hours:</strong> ${parkingInfo.openingHours}</li>
				<li><strong>Payment Methods:</strong> ${parkingInfo.payment}</li>
				<li><strong>Operator:</strong> ${parkingInfo.operator}</li>
			</ul>
		`;
}

// Fetch and display parking info
if (reservedParkingId) {
    // Generate parking info using the reserved parking ID
    const parkingInfo = generateParkingInfo(reservedParkingId);

    // Display the parking info
    document.getElementById("parking-info").innerHTML = displayParkingInfo(parkingInfo);

    // Start the countdown timer
    if (reservationTime) {
        startCountdownTimer(reservationTime);
    }
} else {
    // Display a message if no reservation is found
    document.getElementById("parking-info").innerHTML = `
			<p>No reservations found.</p>
		`;

    // Disable buttons if no reservation exists
    document.getElementById("cancel-reservation-button").disabled = true;
    document.getElementById("open-navigation-button").disabled = true;

    // Hide the timer if no reservation exists
    document.getElementById("countdown-timer").style.display = "none";
}

// Function to start the countdown timer
function startCountdownTimer(reservationTime) {
    const timerElement = document.getElementById("time");

    // Calculate the end time (30 minutes from the reservation time)
    const endTime = new Date(reservationTime).getTime() + 30 * 60 * 1000; // 30 minutes in milliseconds

    const timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const timeLeft = endTime - now;

        if (timeLeft > 0) {
            // Calculate minutes and seconds
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            // Display the time in MM:SS format
            timerElement.textContent = `${minutes.toString().padStart(2, "0")}min ${seconds.toString().padStart(2, "0")}s`;
        } else {
            // Stop the timer when it reaches 0
            clearInterval(timerInterval);

            // Automatically cancel the reservation
            localStorage.removeItem("reservedParkingId");
            localStorage.removeItem("reservationTime");

            // Notify the user
            alert("Your reservation has expired.");

            // Redirect to the map page
            window.location.href = "{{ url_for('map') }}";
        }
    }, 1000); // Update every second
}

// Add event listener to the "Cancel Reservation" button
document.getElementById("cancel-reservation-button").addEventListener("click", () => {
    // Remove the reservation from localStorage
    localStorage.removeItem("reservedParkingId");
    localStorage.removeItem("reservationTime");

    // Redirect to the parking lot page (or any other page)
    window.location.href = "{{ url_for('map') }}";
});

// Add event listener to the "Open Navigation" button
document.getElementById("open-navigation-button").addEventListener("click", () => {
    if (reservedParkingId) {
        // Generate parking info to get the coordinates
        const parkingInfo = generateParkingInfo(reservedParkingId);

        // Open navigation in a new tab (e.g., Google Maps)
        const url = `https://www.google.com/maps/dir/?api=1&destination=${parkingInfo.lat},${parkingInfo.lon}`;
        window.open(url, "_blank");
    } else {
        alert("No reservation found.");
    }
});