document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the flight and fare information stored in sessionStorage.
    // This data is expected to be set during the flight and seat selection process.
    const flightFareInfo = JSON.parse(sessionStorage.getItem('selectedFlightFare'));
    
    // Retrieve the chosen seats from sessionStorage.
    // If no seats are stored, default to an empty array.
    const chosenSeats = JSON.parse(sessionStorage.getItem('chosenSeats')) || [];
    
    // Initialize a string to build the HTML content for the booking confirmation.
    let summaryHTML = '';
    
    // Check if flightFareInfo exists and contains a flight object.
    if (flightFareInfo && flightFareInfo.flight) {
      // Build HTML to display flight details.
      summaryHTML += `<p><strong>Flight Number:</strong> ${flightFareInfo.flight.flightNumber}</p>`;
      summaryHTML += `<p><strong>Destination:</strong> ${flightFareInfo.flight.destination}</p>`;
      summaryHTML += `<p><strong>Fare Option:</strong> ${flightFareInfo.fare}</p>`;
      summaryHTML += `<p><strong>Price:</strong> €${flightFareInfo.price}</p>`;
    } else {
      // If no flight information is available, show a fallback message.
      summaryHTML += `<p>No flight information available.</p>`;
    }
    
    // Check if any seats have been selected.
    if (chosenSeats.length > 0) {
      // Start a section to list the chosen seats.
      summaryHTML += `<h4>Your Seats:</h4><ul>`;
      // Define seat labels (columns) as letters.
      const seatLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
      
      // Loop through each chosen seat and add it to the summary.
      chosenSeats.forEach((seat, index) => {
        // Construct a label for the seat using its row and corresponding letter for its column.
        const seatLabel = `${seat.row}${seatLabels[seat.column - 1]}`;
        summaryHTML += `<li>Passenger ${index + 1}: ${seatLabel}</li>`;
      });
      // Close the unordered list.
      summaryHTML += `</ul>`;
    } else {
      // If no seats were selected, inform the user.
      summaryHTML += `<p>No seats were selected.</p>`;
    }
    
    // Add a confirmation message at the end of the booking summary.
    summaryHTML += `<p class="mt-4 confirmation">Your booking has been confirmed. Thank you for choosing our service!</p>`;
    
    // Insert the generated HTML into the element with the id 'booking-summary' on the page.
    document.getElementById('booking-summary').innerHTML = summaryHTML;
  });
  