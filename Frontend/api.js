// ------------------ FLIGHTS API Functions ------------------

/**
 * Fetch all flights from the server.
 * Returns a promise that resolves to an array of flight objects.
 */
export function fetchAllFlights() {
  return fetch('http://localhost:8080/flights')
    .then(response => {
      if (!response.ok) {
        // If the response is not OK, throw an error to be caught later.
        throw new Error("Error fetching all flights");
      }
      // Parse and return the JSON data.
      return response.json();
    });
}

/**
 * Fetch flights filtered by a specific destination.
 * @param {string} destination - The destination to filter flights.
 * Returns a promise that resolves to an array of flight objects.
 */
export function fetchFlightsByDestination(destination) {
  const url = `http://localhost:8080/flights/destination/${encodeURIComponent(destination)}`;
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Error fetching flights by destination");
      }
      return response.json();
    });
}

/**
 * Fetch flights filtered by a specific date.
 * @param {string} date - The date to filter flights.
 * Returns a promise that resolves to an array of flight objects.
 */
export function fetchFlightsByDate(date) {
  const url = `http://localhost:8080/flights/date/${date}`;
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Error fetching flights by date");
      }
      return response.json();
    });
}

/**
 * Fetch flights filtered by both destination and date.
 * @param {string} destination - The destination to filter flights.
 * @param {string} date - The date to filter flights.
 * Returns a promise that resolves to an array of flight objects.
 */
export function fetchFlightsByDestinationAndDate(destination, date) {
  const url = `http://localhost:8080/flights/destination/${encodeURIComponent(destination)}/date/${date}`;
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Error fetching flights by destination and date");
      }
      return response.json();
    });
}


// ------------------ SEATS API Functions ------------------
/**
* Fetch the seat data for a specific flight from the server.
* Returns a promise that resolves to an array of seat objects.
*/
export function fetchSeatsApi() {
// Retrieve the selected flight info from session storage.
const flightData = JSON.parse(sessionStorage.getItem('selectedFlightFare'));
const flightNumber = flightData.flight.flightNumber;

// Build the URL using the flight number.
const url = `http://localhost:8080/flights/${flightNumber}/seats`;
return fetch(url)
  .then(response => {
    if (!response.ok) {
      throw new Error("Error fetching seats");
    }
    return response.json();
  });
}

/**
* Book a single seat for the specified flight.
* @param {number} row - The row number of the seat.
* @param {number} col - The column number of the seat.
* Returns a promise that resolves to a confirmation message.
*/
export function bookSeatApi(row, col) {
  const flightData = JSON.parse(sessionStorage.getItem('selectedFlightFare'));
  const flightNumber = flightData.flight.flightNumber;
  
  // Use the flight number in the endpoint URL.
  return fetch(`http://localhost:8080/flights/${flightNumber}/seats/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ row, col })
  }).then(response => {
    if (!response.ok) {
      throw new Error("Error booking seat");
    }
    return response.text();
  });
}


/**
* Confirm (book) multiple seats for the specified flight.
* @param {Array} selectedSeats - An array of seat objects selected by the user.
* Returns a promise that resolves when all booking requests complete.
*/
export function confirmSeatsApi(selectedSeats) {
  const flightData = JSON.parse(sessionStorage.getItem('selectedFlightFare'));
  const flightNumber = flightData.flight.flightNumber;
  
  // Build the URL with the flight number for each booking.
  return Promise.all(
    selectedSeats.map(seat =>
      fetch(`http://localhost:8080/flights/${flightNumber}/seats/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row: seat.row, col: seat.column })
      }).then(response => {
        if (!response.ok) {
          throw new Error("Error booking one of the seats");
        }
        return response.text();
      })
    )
  );
}