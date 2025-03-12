// Import API functions to fetch flight data from the server.
import { fetchAllFlights, fetchFlightsByDestination, fetchFlightsByDate, fetchFlightsByDestinationAndDate } from './api.js';
// Import the UI function that displays the flight list.
import { displayFlights } from './ui.js';


// Global array to store the flight data retrieved from the server.
let flightsData = [];

// -------------------- Flight Loading Functions --------------------

/**
 * Load all flights from the server.
 * Updates the global flightsData variable and renders the flight list in the UI.
 */
function loadAllFlights() {
  fetchAllFlights()
    .then(data => {
      flightsData = data;       // Save fetched flights into the global variable.
      displayFlights(data);     // Render the flights in the UI.
    })
    .catch(error => {
      console.error("Error fetching all flights:", error);
      alert('Error fetching flight data. Please try again later.');
    });
}

/**
 * Load flights filtered by destination.
 * @param {string} destination - The destination to filter flights by.
 */
function loadFlightsByDestination(destination) {
  fetchFlightsByDestination(destination)
    .then(data => {
      flightsData = data;
      displayFlights(data);
    })
    .catch(error => {
      console.error("Error fetching flights by destination:", error);
      alert('Error fetching flight data. Please try again later.');
    });
}

/**
 * Load flights filtered by date.
 * @param {string} date - The date to filter flights by.
 */
function loadFlightsByDate(date) {
  fetchFlightsByDate(date)
    .then(data => {
      flightsData = data;
      displayFlights(data);
    })
    .catch(error => {
      console.error("Error fetching flights by date:", error);
      alert('Error fetching flight data. Please try again later.');
    });
}

/**
 * Load flights filtered by both destination and date.
 * @param {string} destination - The destination to filter flights by.
 * @param {string} date - The date to filter flights by.
 */
function loadFlightsByDestinationAndDate(destination, date) {
  fetchFlightsByDestinationAndDate(destination, date)
    .then(data => {
      flightsData = data;
      displayFlights(data);
    })
    .catch(error => {
      console.error("Error fetching flights by destination and date:", error);
      alert('Error fetching flight data. Please try again later.');
    });
}

// -------------------- Filtering --------------------

/**
 * Consolidated filtering function.
 * Reads the destination and date filter values from the DOM and calls the appropriate loading function.
 */
function applyFilters() {
  // Retrieve filter values from input fields.
  const destination = document.getElementById('destination').value;
  const date = document.getElementById('date').value;

  // Determine which API call to make based on the provided filters.
  if (destination && date) {
    loadFlightsByDestinationAndDate(destination, date);
  } else if (destination) {
    loadFlightsByDestination(destination);
  } else if (date) {
    loadFlightsByDate(date);
  } else {
    loadAllFlights();
  }
}

// -------------------- Event Listeners --------------------
// Attach event listeners to trigger filtering when the destination or date inputs change,
// or when the "Apply Filters" button is clicked.
document.getElementById('destination').addEventListener('change', applyFilters);
document.getElementById('date').addEventListener('change', applyFilters);
document.getElementById('apply-filters').addEventListener('click', applyFilters);

// -------------------- Initialization --------------------
// On initial page load, fetch and display all flights.
loadAllFlights();
