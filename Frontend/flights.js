let flightsData = []; // Global array to store fetched flights

// ----- Fetching Flights -----

// Fetch all flights initially
function fetchAllFlights() {
    fetch('http://localhost:8080/flights')
        .then(response => response.json())
        .then(data => {
            flightsData = data;
            displayFlights(data);
        })
        .catch(error => {
            console.error("Error fetching all flights:", error);
            alert('Error fetching flight data. Please try again later.');
        });
}

// Fetch flights by destination
function fetchFlightsByDestination(destination) {
    const url = `http://localhost:8080/flights/destination/${encodeURIComponent(destination)}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            flightsData = data;
            displayFlights(data);
        })
        .catch(error => {
            console.error("Error fetching flights by destination:", error);
            alert('Error fetching flight data. Please try again later.');
        });
}

// Fetch flights by date
function fetchFlightsByDate(date) {
    const url = `http://localhost:8080/flights/date/${date}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            flightsData = data;
            displayFlights(data);
        })
        .catch(error => {
            console.error("Error fetching flights by date:", error);
            alert('Error fetching flight data. Please try again later.');
        });
}

// Fetch flights by both destination and date
function fetchFlightsByDestinationAndDate(destination, date) {
    const url = `http://localhost:8080/flights/destination/${encodeURIComponent(destination)}/date/${date}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            flightsData = data;
            displayFlights(data);
        })
        .catch(error => {
            console.error("Error fetching flights by destination and date:", error);
            alert('Error fetching flight data. Please try again later.');
        });
}

// ----- Displaying Flights -----

// Function to display flights on the frontend
function displayFlights(flights) {
    const flightsList = document.getElementById('flights-list');
    flightsList.innerHTML = ''; // Clear previous flights

    if (flights && flights.length > 0) {
        flights.forEach(flight => {
            const flightRow = document.createElement('tr');
            // Give the row an ID so we can find it again
            flightRow.id = `flight-row-${flight.flightNumber}`;

            const departureDate = new Date(flight.departureTime);
            flightRow.innerHTML = `
                <td>${flight.destination}</td>
                <td>${departureDate.toLocaleDateString()}</td>
                <td>${departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td>€${flight.price}</td>
                <td>
                  <button class="btn btn-primary select-flight" data-flight-id="${flight.flightNumber}">
                    Select
                  </button>
                </td>
            `;
            flightsList.appendChild(flightRow);
        });
    } else {
        flightsList.innerHTML = '<tr><td colspan="5">No flights available for this filter.</td></tr>';
    }
    
    // Attach event listeners to the select buttons
    document.querySelectorAll('.select-flight').forEach(button => {
        button.addEventListener('click', event => {
            const flightId = event.target.getAttribute('data-flight-id');
            const selectedFlight = flights.find(f => f.flightNumber === flightId);
            if (selectedFlight) {
                // Pass the selected flight AND the flight row element to showFareOptions
                const flightRowEl = document.getElementById(`flight-row-${flightId}`);
                showFareOptions(selectedFlight, flightRowEl);
            }
        });
    });
}

// ----- Fare Options Details (Constants) -----

const basicFareDetails = `
  <ul class="list-unstyled mt-3 mb-4">
    <li class="mb-2"><img src="./images/handbaggage.svg" height="30" style="margin-right: 8px;">1 cabin bag + 1 personal item (8 kg total)</li>
    <li class="mb-2"><img src="./images/rebooking.svg" height="30" style="margin-right: 8px;">Rebooking 50 € + possible fare difference</li>
    <li class="mb-2"><img src="./images/points.svg" height="30" style="margin-right: 8px;">1 point / €</li>
    <li class="mb-2" style="color: gray;"><img src="./images/nonrefundable.svg" height="30" style="margin-right: 8px;  opacity: 0.6;">Non-refundable</li>
  </ul>
`;

const classicFareDetails = `
  <ul class="list-unstyled mt-3 mb-4">
    <li class="mb-2"><img src="./images/handbaggage.svg" height="30" style="margin-right: 8px;">1 cabin bag + 1 personal item (8 kg total)</li>
    <li class="mb-2"><img src="./images/baggage.svg" height="30" style="margin-right: 8px;">1 bag (23 kg total)</li>
    <li class="mb-2"><img src="./images/seatselection.svg" height="30" style="margin-right: 8px;">Seat selection</li>
    <li class="mb-2"><img src="./images/rebooking.svg" height="30" style="margin-right: 8px;">Rebooking 50 € + possible fare difference</li>
    <li class="mb-2"><img src="./images/points.svg" height="30" style="margin-right: 8px;">1 point / € + 50 bonus points</li>
    <li class="mb-2" style="color: gray;"><img src="./images/nonrefundable.svg" height="30" style="margin-right: 8px; opacity: 0.6;">Non-refundable</li>
  </ul>
`;

const flexFareDetails = `
  <ul class="list-unstyled mt-3 mb-4">
    <li class="mb-2"><img src="./images/handbaggage.svg" height="30" style="margin-right: 8px;">1 cabin bag + 1 personal item (8 kg total)</li>
    <li class="mb-2"><img src="./images/baggage.svg" height="30" style="margin-right: 8px;">2 bags (46 kg total)</li>
    <li class="mb-2"><img src="./images/seatselection.svg" height="30" style="margin-right: 8px;">Seat selection</li>
    <li class="mb-2"><img src="./images/priority.svg" height="30" style="margin-right: 8px;">Priority boarding</li>
    <li class="mb-2"><img src="./images/rebooking.svg" height="30" style="margin-right: 8px;">Rebooking before departure for free + possible fare differences</li>
    <li class="mb-2"><img src="./images/points.svg" height="30" style="margin-right: 8px;">1 point / € + 100 bonus points</li>
    <li class="mb-2"><img src="./images/refundable.svg" height="30" style="margin-right: 8px;">Fully refundable as a gift card or refund fee 25 €</li>
  </ul>
`;

// ----- Fare Options Display Using Bootstrap Collapse -----

function showFareOptions(flight, flightRowEl) {
    console.log("showFareOptions called for flight:", flight);
    // Calculate dynamic fare prices based on the flight's base price
    const basePrice = flight.price;
    const classicPrice = basePrice + 50;
    const flexPrice = basePrice + 100;

    // Build the dynamic HTML for all three fare options, including details
    const fareHTML = `
      <div class="row row-cols-1 row-cols-md-3 mb-3 text-center">
        <div class="col">
          <div class="card mb-4 rounded-3 shadow-sm">
            <div class="card-header py-3">
              <h4 class="my-0 fw-normal">Economy BASIC</h4>
            </div>
            <div class="card-body">
              <h2 class="card-title pricing-card-title">€${basePrice.toFixed(2)}</h2>
              ${basicFareDetails}
              <button type="button" class="w-100 btn btn-lg btn-outline-primary fare-option" data-fare="basic" data-price="${basePrice}">
                Select
              </button>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card mb-4 rounded-3 shadow-sm border-primary">
            <div class="card-header py-3 text-bg-primary border-primary">
              <h4 class="my-0 fw-normal">Economy CLASSIC</h4>
            </div>
            <div class="card-body">
              <h2 class="card-title pricing-card-title">€${classicPrice.toFixed(2)}</h2>
              ${classicFareDetails}
              <button type="button" class="w-100 btn btn-lg btn-primary fare-option" data-fare="classic" data-price="${classicPrice}">
                Select
              </button>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card mb-4 rounded-3 shadow-sm">
            <div class="card-header py-3">
              <h4 class="my-0 fw-normal">Economy FLEX</h4>
            </div>
            <div class="card-body">
              <h2 class="card-title pricing-card-title">€${flexPrice.toFixed(2)}</h2>
              ${flexFareDetails}
              <button type="button" class="w-100 btn btn-lg btn-outline-primary fare-option" data-fare="flex" data-price="${flexPrice}">
                Select
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

// Create a new <tr> right below the flight row
const fareRow = document.createElement('tr');
fareRow.id = `fare-row-${flight.flightNumber}`;

// Create a single cell that spans all columns
const fareCell = document.createElement('td');
fareCell.colSpan = 5;

// Optionally, wrap the fareHTML in a .collapse div if you want animation
// For simplicity, let's just show it directly:
fareCell.innerHTML = fareHTML;

// Append the cell to the new row
fareRow.appendChild(fareCell);

// Insert the new row right after the flightRowEl
flightRowEl.parentNode.insertBefore(fareRow, flightRowEl.nextSibling);

// Attach event listeners to the fare option buttons
fareRow.querySelectorAll('.fare-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const selectedFare = e.target.getAttribute('data-fare');
        const selectedPrice = e.target.getAttribute('data-price');
        sessionStorage.setItem('selectedFlightFare', JSON.stringify({
            flight: flight,
            fare: selectedFare,
            price: selectedPrice
        }));

        // Use selectedFlightFare to display the relevant seat map or pass on further details.
        const selectedFlightFare = JSON.parse(sessionStorage.getItem('selectedFlightFare'));
console.log(selectedFlightFare);
        // Redirect to the seat map page
        window.location.href = 'seats.html';
    });
});
}

// ----- Event Listeners for Filtering -----

document.getElementById('destination').addEventListener('change', function () {
    const selectedDestination = this.value;
    const selectedDate = document.getElementById('date').value;
    
    if (selectedDestination && selectedDate) {
        fetchFlightsByDestinationAndDate(selectedDestination, selectedDate);
    } else if (selectedDestination) {
        fetchFlightsByDestination(selectedDestination);
    } else if (selectedDate) {
        fetchFlightsByDate(selectedDate);
    } else {
        fetchAllFlights();
    }
});

document.getElementById('date').addEventListener('change', function () {
    const selectedDate = this.value;
    const selectedDestination = document.getElementById('destination').value;
    
    if (selectedDestination && selectedDate) {
        fetchFlightsByDestinationAndDate(selectedDestination, selectedDate);
    } else if (selectedDestination) {
        fetchFlightsByDestination(selectedDestination);
    } else if (selectedDate) {
        fetchFlightsByDate(selectedDate);
    } else {
        fetchAllFlights();
    }
});

document.getElementById('apply-filters').addEventListener('click', () => {
    const destination = document.getElementById('destination').value;
    const date = document.getElementById('date').value;

    if (destination && date) {
        fetchFlightsByDestinationAndDate(destination, date);
    } else if (destination) {
        fetchFlightsByDestination(destination);
    } else if (date) {
        fetchFlightsByDate(date);
    } else {
        fetchAllFlights();
    }
});

// ----- Initialization -----

// Call fetchAllFlights when the page loads to show all flights initially
fetchAllFlights();
