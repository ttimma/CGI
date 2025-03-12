// -------------------- Module Imports --------------------
// Import API functions for fetching and booking seats from the server.
import { fetchSeatsApi, bookSeatApi, confirmSeatsApi } from './api.js';
// Import UI functions to render the seat map and display chosen seats.
import { renderSeats, displayChosenSeats } from './ui.js';

// -------------------- Global State Variables --------------------
// allSeats will hold all seat objects fetched from the server.
let allSeats = [];
// selectedSeats holds the seats that the user has manually selected.
let selectedSeats = [];

// -------------------- Fetch and Render Seats --------------------

/**
 * Fetch seat data from the API and render them on the seat map.
 */
function fetchSeats() {
  fetchSeatsApi()
    .then(data => {
      console.log("Fetched seats data:", data); // Debug log to inspect fetched data.
      allSeats = data; // Store the fetched seat data in the global variable.
      // Render seats by passing the data and a callback to handle seat clicks.
      renderSeats(data, toggleSeatSelection);
    })
    .catch(error => console.error("Error fetching seats:", error));
}

// -------------------- Seat Selection and Booking Logic --------------------

/**
 * Toggle the manual selection of a seat.
 * If a seat is already selected, unselect it; otherwise, add it to the selection.
 * @param {Object} seat - The seat object that was clicked.
 */
function toggleSeatSelection(seat) {
  // Remove any existing recommendation highlights (used for auto-selection based on preferences).
  document.querySelectorAll('.recommended').forEach(el => el.classList.remove('recommended'));

  // Get the element used to display error messages related to passenger selection.
  const errorDiv = document.getElementById('passengerError');
  errorDiv.textContent = '';
  errorDiv.style.display = 'none';

  // Check if the seat is already in the selectedSeats array.
  const existingIndex = selectedSeats.findIndex(s => s.row === seat.row && s.column === seat.column);
  const seatEl = document.getElementById(`seat-${seat.row}-${seat.column}`);
  // Determine the allowed number of seats based on user preferences or default to 6.
  const allowedSeats = window.currentSeatPreferences ? window.currentSeatPreferences.numPassengers : 6;

  if (existingIndex !== -1) {
    // If the seat is already selected, remove it from the selection.
    selectedSeats.splice(existingIndex, 1);
    if (seatEl) seatEl.classList.remove('selected-seat');
  } else {
    // If maximum allowed seats are already selected, display an error message.
    if (selectedSeats.length >= allowedSeats) {
      errorDiv.textContent = `You can only select up to ${allowedSeats} seat(s).`;
      errorDiv.style.display = 'block';
      return;
    }
    // Otherwise, add the seat to the selection and highlight it.
    selectedSeats.push(seat);
    if (seatEl) seatEl.classList.add('selected-seat');
  }

  // Update the UI with the currently selected seats.
  displayChosenSeats(selectedSeats);
}

/**
 * Confirm and book all selected seats.
 * Stores the chosen seats in sessionStorage and sends booking requests to the API.
 */
function confirmSelectedSeats() {
  // If no seats have been selected, exit the function.
  if (selectedSeats.length === 0) {
    console.log("No seats selected.");
    return;
  }

  // Save the selected seats to sessionStorage for later confirmation.
  sessionStorage.setItem('chosenSeats', JSON.stringify(selectedSeats));

  // Call the API to confirm the booking of all selected seats.
  confirmSeatsApi(selectedSeats)
    .then(results => {
      // Display the results (messages) returned by the API.
      const messageDiv = document.getElementById('message');
      messageDiv.textContent = results.join(' | ');
      // Clear the selection after booking.
      selectedSeats = [];
      displayChosenSeats([]);
      // Redirect the user to the booking confirmation page.
      window.location.href = 'bookingConfirmation.html';
    })
    .catch(error => console.error("Error booking seats:", error));
}

/**
 * Book a single seat. This function can be used if needed.
 * @param {number} row - The row number of the seat.
 * @param {number} col - The column number of the seat.
 */
function bookSeat(row, col) {
  bookSeatApi(row, col)
    .then(message => {
      const messageDiv = document.getElementById('message');
      messageDiv.textContent = message;
      // Re-fetch seats after booking to update the seat map.
      fetchSeats();
    })
    .catch(error => console.error("Error booking seat:", error));
}

// -------------------- Business Logic for Seat Preferences --------------------

/**
 * Check if a seat matches the user's seat preferences.
 * @param {Object} seat - The seat object.
 * @param {Object} preferences - The user's seat preferences.
 * @returns {boolean} - True if the seat matches the preferences, false otherwise.
 */
function matches(seat, preferences) {
  let match = true;
  if (preferences.seatPreference === 'window' && !seat.window) {
    match = false;
  }
  if (preferences.seatPreference === 'aisle' && !seat.aisle) {
    match = false;
  }
  if (preferences.extraLegroom && !seat.extraLegroom) {
    match = false;
  }
  return match;
}

/**
 * Apply logic for a single passenger by auto-selecting one available seat
 * that matches the given preferences.
 * @param {Object} preferences - The user's seat preferences.
 */
function applySinglePassengerLogic(preferences) {
  let availableSeats = allSeats.filter(seat => !seat.taken && matches(seat, preferences));
  if (availableSeats.length > 0) {
    // Randomly select one available seat.
    const chosenSeat = availableSeats[Math.floor(Math.random() * availableSeats.length)];
    const seatEl = document.getElementById(`seat-${chosenSeat.row}-${chosenSeat.column}`);
    if (seatEl) seatEl.classList.add('recommended');
    selectedSeats = [chosenSeat];
    displayChosenSeats([chosenSeat]);
  } else {
    displayChosenSeats([]);
  }
}

/**
 * Apply seat preferences for multiple passengers.
 * It attempts to highlight and allocate seats based on the user's preferences.
 * @param {Object} preferences - The user's seat preferences.
 */
function applySeatPreferences(preferences) {
  // Remove any recommendation highlights from the current seat map.
  allSeats.forEach(seat => {
    const seatEl = document.getElementById(`seat-${seat.row}-${seat.column}`);
    if (seatEl) seatEl.classList.remove('recommended');
  });

  // Clear the currently selected seats.
  selectedSeats = [];

  // If there's only one passenger, use the single-passenger logic.
  if (preferences.numPassengers === 1) {
    applySinglePassengerLogic(preferences);
    return;
  }

  // Filter seats that are available and match the given preferences.
  let matchingSeats = allSeats.filter(seat => !seat.taken && matches(seat, preferences));
  // Sort the matching seats by row and then by column.
  matchingSeats.sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.column - b.column;
  });

  // Group matching seats by their row number.
  const seatsByRow = {};
  matchingSeats.forEach(seat => {
    if (!seatsByRow[seat.row]) seatsByRow[seat.row] = [];
    seatsByRow[seat.row].push(seat);
  });
  for (const row in seatsByRow) {
    seatsByRow[row].sort((a, b) => a.column - b.column);
  }

  // Try to find a consecutive block of seats in one row that can accommodate all passengers.
  let consecutiveBlock = findConsecutiveBlockInOneRow(preferences.numPassengers, seatsByRow);
  if (consecutiveBlock.length === preferences.numPassengers) {
    consecutiveBlock.forEach(seat => {
      const seatEl = document.getElementById(`seat-${seat.row}-${seat.column}`);
      if (seatEl) seatEl.classList.add('recommended');
    });
    selectedSeats = consecutiveBlock.slice();
    displayChosenSeats(consecutiveBlock);
    return;
  }

  // If no consecutive block is found, try to allocate seats close together across rows.
  let allocated = allocateSeatsCloseTogether(preferences.numPassengers, seatsByRow);
  if (allocated.length === preferences.numPassengers) {
    allocated.forEach(seat => {
      const seatEl = document.getElementById(`seat-${seat.row}-${seat.column}`);
      if (seatEl) seatEl.classList.add('recommended');
    });
    selectedSeats = allocated.slice();
    displayChosenSeats(allocated);
  } else {
    console.log(`Could not seat ${preferences.numPassengers} passengers with these preferences.`);
    displayChosenSeats([]);
  }
}

/**
 * Attempt to find a consecutive block of seats in a single row.
 * @param {number} numPassengers - Number of passengers to seat.
 * @param {Object} seatsByRow - Object grouping seats by row.
 * @returns {Array} - An array of seat objects forming a consecutive block, or empty if not found.
 */
function findConsecutiveBlockInOneRow(numPassengers, seatsByRow) {
  for (let rowStr in seatsByRow) {
    const rowSeats = seatsByRow[rowStr];
    let consecutive = [];
    for (let seat of rowSeats) {
      if (consecutive.length === 0) {
        consecutive.push(seat);
      } else {
        let lastSeat = consecutive[consecutive.length - 1];
        if (seat.column === lastSeat.column + 1) {
          consecutive.push(seat);
        } else {
          consecutive = [seat];
        }
      }
      if (consecutive.length === numPassengers) {
        return consecutive;
      }
    }
  }
  return [];
}

/**
 * Allocate seats close together across rows if a single row block is not available.
 * @param {number} numPassengers - Number of passengers to seat.
 * @param {Object} seatsByRow - Object grouping seats by row.
 * @returns {Array} - An array of allocated seat objects.
 */
function allocateSeatsCloseTogether(numPassengers, seatsByRow) {
  let allocated = [];
  let passengersLeft = numPassengers;
  // Get all row numbers sorted in ascending order.
  let rows = Object.keys(seatsByRow).map(r => parseInt(r, 10)).sort((a, b) => a - b);
  for (let i = 0; i < rows.length; i++) {
    const rowNum = rows[i];
    const rowSeats = seatsByRow[rowNum];
    if (rowSeats.length >= passengersLeft) {
      allocated.push(...rowSeats.slice(0, passengersLeft));
      passengersLeft = 0;
      break;
    } else {
      allocated.push(...rowSeats);
      passengersLeft -= rowSeats.length;
    }
  }
  return allocated;
}

// -------------------- DOMContentLoaded Initialization --------------------

document.addEventListener('DOMContentLoaded', () => {
  // Display selected flight information if available in sessionStorage.
  const selectedFlight = sessionStorage.getItem('selectedFlight');
  if (selectedFlight) {
    console.log('Selected flight:', selectedFlight);
    document.getElementById('flight-info').textContent = `Flight: ${selectedFlight}`;
  }

  // Fetch and render seats on the page.
  fetchSeats();

  // Set up the event listener for the "Confirm Seats" button.
  const confirmSeatsBtn = document.getElementById('confirm-seats');
  if (confirmSeatsBtn) {
    confirmSeatsBtn.addEventListener('click', confirmSelectedSeats);
  }

  // Set up the event listener for the seat preferences form.
  const seatPrefForm = document.getElementById('seat-preferences-form');
  const seatPrefNote = document.getElementById('seatPrefNote');
  const errorDiv = document.getElementById('passengerError');

  if (seatPrefForm) {
    seatPrefForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Prevent the default form submission behavior.
      const numPassengers = parseInt(document.getElementById('numPassengers').value, 10);
      const seatPreference = document.querySelector('input[name="seatPreference"]:checked').value;
      const extraLegroom = document.getElementById('extraLegroom').checked;

      // If multiple passengers choose window or aisle preference, show a note and do not auto-highlight seats.
      if (numPassengers > 1 && (seatPreference === 'window' || seatPreference === 'aisle')) {
        seatPrefNote.style.display = 'block';
        errorDiv.textContent = '';
        return;
      } else {
        seatPrefNote.style.display = 'none';
      }

      // Validate that the number of passengers does not exceed the maximum allowed (6).
      if (numPassengers > 6) {
        errorDiv.textContent = "You can only book up to 6 passengers. Please contact Customer Service for larger groups.";
        errorDiv.style.display = 'block';
        return;
      } else {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
      }

      // Build the seat preferences object from the form values.
      const seatPreferences = {
        numPassengers: numPassengers,
        seatPreference: seatPreference,
        extraLegroom: extraLegroom
      };
      // Store the preferences globally for use in other functions.
      window.currentSeatPreferences = seatPreferences;
      console.log('Seat Preferences:', seatPreferences);
      // Apply the seat preferences to auto-select/recommend seats.
      applySeatPreferences(seatPreferences);
    });
  }
});
