const seatMap = document.getElementById('seat-map');
const messageDiv = document.getElementById('message');
const API_URL = 'http://localhost:8080/api/seats';

let allSeats = []; // Global array of seat objects
let selectedSeats = []; // Array to store user-selected seats (manually clicked)

function fetchSeats() {
  fetch(API_URL)
    .then(response => response.json())
    .then(data => {
      allSeats = data; // store seats globally
      renderSeats(data);
    })
    .catch(error => console.error("Error fetching seats:", error));
}

function renderSeats(seats) {
  seatMap.innerHTML = '';

  const seatLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Constants for positioning
  const seatHorizontalSpacing = 16;
  const seatVerticalSpacing = 23;
  const leftOffset = 99;
  const topOffset = 202;
  const aisleWidth = 22;
  const extraLegroomSpacing = 8;

  let currentRowNumber = null;
  let currentRowOffset = topOffset;
  let currentRowElement = null;

  seats.forEach(seat => {
    if (seat.row !== currentRowNumber) {
      currentRowNumber = seat.row;
      currentRowOffset += seatVerticalSpacing;
      if (seat.row === 11 || seat.row === 12) {
        currentRowOffset += extraLegroomSpacing;
      }
      currentRowElement = document.createElement('div');
      currentRowElement.classList.add('row');
      currentRowElement.dataset.row = seat.row;
      seatMap.appendChild(currentRowElement);
    }

    let seatLeftOffset = leftOffset + (seat.column - 1) * seatHorizontalSpacing;
    if (seat.column >= 4) {
      seatLeftOffset += aisleWidth;
    }

    const seatTopOffset = currentRowOffset;

    const seatElement = document.createElement('div');
    seatElement.classList.add('plane-seat');
    seatElement.id = `seat-${seat.row}-${seat.column}`;
    seatElement.style.left = `${seatLeftOffset}px`;
    seatElement.style.top = `${seatTopOffset}px`;

    // Set the text to A-F based on 1-based seat.column
    seatElement.textContent = seatLabels[seat.column - 1];

    if (seat.taken) {
      seatElement.classList.add('taken');
    } else {
      seatElement.classList.add('available');
      // Instead of immediate booking, we now toggle manual selection.
      seatElement.addEventListener('click', () => toggleSeatSelection(seat));
    }

    currentRowElement.appendChild(seatElement);
  });
}

function toggleSeatSelection(seat) {
    // Remove any recommendation highlights from preferences,
    // so manual selections override them.
    document.querySelectorAll('.recommended').forEach(el => el.classList.remove('recommended'));
  
    // Retrieve error element (passengerError) to show notifications
    const errorDiv = document.getElementById('passengerError');
    // Clear any existing error message
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
  
    // Check if the seat is already manually selected
    const existingIndex = selectedSeats.findIndex(
      s => s.row === seat.row && s.column === seat.column
    );
    const seatEl = document.getElementById(`seat-${seat.row}-${seat.column}`);
  
    // Retrieve allowed seats from preferences if set, otherwise default to 6.
    const allowedSeats = window.currentSeatPreferences
      ? window.currentSeatPreferences.numPassengers
      : 6;
  
    if (existingIndex !== -1) {
      // If already selected, unselect it.
      selectedSeats.splice(existingIndex, 1);
      if (seatEl) seatEl.classList.remove('selected-seat');
    } else {
      // Before adding, check if we've reached the maximum allowed seats.
      if (selectedSeats.length >= allowedSeats) {
        errorDiv.textContent = `You can only select up to ${allowedSeats} seat(s).`;
        errorDiv.style.display = 'block';
        return; // Do not add another seat.
      }
      // Otherwise, add the seat.
      selectedSeats.push(seat);
      if (seatEl) seatEl.classList.add('selected-seat');
    }
    
    // Update the "Your Seats" UI with the current selection.
    displayChosenSeats(selectedSeats);
  }
  
  

// Book selected seats when the user confirms
function confirmSelectedSeats() {
    if (selectedSeats.length === 0) {
      console.log("No seats selected.");
      return;
    }
    
    // Save selected seats in sessionStorage for the confirmation page
    sessionStorage.setItem('chosenSeats', JSON.stringify(selectedSeats));
    
    // Book each selected seat (using Promise.all for all bookings)
    Promise.all(
      selectedSeats.map(seat => {
        return fetch(`${API_URL}/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ row: seat.row, col: seat.column })
        }).then(response => response.text());
      })
    ).then(results => {
      messageDiv.textContent = results.join(' | ');
      // Clear selection after booking
      selectedSeats = [];
      displayChosenSeats([]);
      
      // Redirect to the booking confirmation page
      window.location.href = 'bookingConfirmation.html';
    }).catch(error => console.error("Error booking seats:", error));
  }
  
  

function bookSeat(row, col) {
  fetch(`${API_URL}/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ row, col })
  })
    .then(response => response.text())
    .then(message => {
      messageDiv.textContent = message;
      fetchSeats();
    })
    .catch(error => console.error("Error booking seat:", error));
}

document.addEventListener('DOMContentLoaded', () => {
  // Display selected flight info if available
  const selectedFlight = sessionStorage.getItem('selectedFlight');
  if (selectedFlight) {
    console.log('Selected flight:', selectedFlight);
    document.getElementById('flight-info').textContent = `Flight: ${selectedFlight}`;
  }
  // Fetch and render seats
  fetchSeats();

  // Listen for "Book Selected Seats" button
  const confirmSeatsBtn = document.getElementById('confirm-seats');
  if (confirmSeatsBtn) {
    confirmSeatsBtn.addEventListener('click', confirmSelectedSeats);
  }

  const seatPrefForm = document.getElementById('seat-preferences-form');
  const seatPrefNote = document.getElementById('seatPrefNote');
  const errorDiv = document.getElementById('passengerError');

  if (seatPrefForm) {
    seatPrefForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const numPassengers = parseInt(document.getElementById('numPassengers').value, 10);
      const seatPreference = document.querySelector('input[name="seatPreference"]:checked').value;
      const extraLegroom = document.getElementById('extraLegroom').checked;

      // 1) If user chooses >1 passenger + window/aisle, show note and skip highlighting
      if (numPassengers > 1 && (seatPreference === 'window' || seatPreference === 'aisle')) {
        seatPrefNote.style.display = 'block';
        errorDiv.textContent = '';
        return;
      } else {
        seatPrefNote.style.display = 'none';
      }

      // 2) If more than 6 passengers, show an error
      if (numPassengers > 6) {
        errorDiv.textContent = "You can only book up to 6 passengers. Please contact Customer Service for larger groups.";
        errorDiv.style.display = 'block';
        return;
      } else {
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
      }

      // 3) Otherwise, proceed to highlight seats per preferences
      const seatPreferences = {
        numPassengers: numPassengers,
        seatPreference: seatPreference,
        extraLegroom: extraLegroom
      };
      window.currentSeatPreferences = seatPreferences;
      console.log('Seat Preferences:', seatPreferences);

      applySeatPreferences(seatPreferences);
    });
  }
});

/**
 * Checks if a seat matches the user’s preferences (window, aisle, extraLegroom).
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
 * For a single passenger, highlight exactly one available seat from the filtered list.
 */
function applySinglePassengerLogic(preferences) {
    let availableSeats = allSeats.filter(seat => !seat.taken && matches(seat, preferences));
    if (availableSeats.length > 0) {
      // Choose one random seat from the filtered list
      const chosenSeat = availableSeats[Math.floor(Math.random() * availableSeats.length)];
      const seatEl = document.getElementById(`seat-${chosenSeat.row}-${chosenSeat.column}`);
      if (seatEl) seatEl.classList.add('recommended');
  
      // Update "Your Seats" section to show the single seat and store it in selectedSeats
      selectedSeats = [chosenSeat];
      displayChosenSeats([chosenSeat]);
    } else {
      displayChosenSeats([]);
    }
  }
  
/**
 * Main function that applies seat preferences for multiple passengers.
 */
function applySeatPreferences(preferences) {
    // Clear existing recommendations
    allSeats.forEach(seat => {
      const seatEl = document.getElementById(`seat-${seat.row}-${seat.column}`);
      if (seatEl) seatEl.classList.remove('recommended');
    });
  
    // Clear any previously auto‑selected seats (if any)
    selectedSeats = [];
  
    // If single passenger => use single-passenger logic
    if (preferences.numPassengers === 1) {
      applySinglePassengerLogic(preferences);
      return;
    }
  
    // For multiple passengers:
    let matchingSeats = allSeats.filter(seat => !seat.taken && matches(seat, preferences));
    // Sort by row, then column
    matchingSeats.sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.column - b.column;
    });
  
    // Group seats by row
    const seatsByRow = {};
    matchingSeats.forEach(seat => {
      if (!seatsByRow[seat.row]) seatsByRow[seat.row] = [];
      seatsByRow[seat.row].push(seat);
    });
    for (const row in seatsByRow) {
      seatsByRow[row].sort((a, b) => a.column - b.column);
    }
  
    // 1) Try to find a single row with a consecutive block for all passengers
    let consecutiveBlock = findConsecutiveBlockInOneRow(preferences.numPassengers, seatsByRow);
    if (consecutiveBlock.length === preferences.numPassengers) {
      consecutiveBlock.forEach(seat => {
        const seatEl = document.getElementById(`seat-${seat.row}-${seat.column}`);
        if (seatEl) seatEl.classList.add('recommended');
      });
      // Update global selectedSeats for confirmation and update "Your Seats" section
      selectedSeats = consecutiveBlock.slice();
      displayChosenSeats(consecutiveBlock);
      return;
    }
  
    // 2) Otherwise, allocate seats across multiple rows
    let allocated = allocateSeatsCloseTogether(preferences.numPassengers, seatsByRow);
    if (allocated.length === preferences.numPassengers) {
      allocated.forEach(seat => {
        const seatEl = document.getElementById(`seat-${seat.row}-${seat.column}`);
        if (seatEl) seatEl.classList.add('recommended');
      });
      // Update global selectedSeats for confirmation and update "Your Seats" section
      selectedSeats = allocated.slice();
      displayChosenSeats(allocated);
    } else {
      console.log(`Could not seat ${preferences.numPassengers} passengers with these preferences.`);
      displayChosenSeats([]);
    }
  }
  

/**
 * Finds a single row that can seat 'numPassengers' consecutively.
 * Returns an array of seats if found, else empty array.
 */
function findConsecutiveBlockInOneRow(numPassengers, seatsByRow) {
  for (let rowStr in seatsByRow) {
    const rowSeats = seatsByRow[rowStr]; // sorted by column
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
 * Allocates seats across multiple rows if a single-row consecutive block isn't found.
 * Returns an array of allocated seat objects.
 */
function allocateSeatsCloseTogether(numPassengers, seatsByRow) {
  let allocated = [];
  let passengersLeft = numPassengers;

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

/**
 * Displays the chosen seat(s) in the "Your Seats" section.
 * seatsArray is an array of seat objects with row/column.
 */
function displayChosenSeats(seatsArray) {
  const chosenSeatsDiv = document.getElementById('chosen-seats');
  const chosenSeatsList = document.getElementById('chosen-seats-list');

  if (!chosenSeatsDiv || !chosenSeatsList) return;

  // Clear previous list items
  chosenSeatsList.innerHTML = '';

  if (seatsArray.length === 0) {
    chosenSeatsDiv.style.display = 'none';
    return;
  }

  chosenSeatsDiv.style.display = 'block';
  const seatLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  seatsArray.forEach((seat, index) => {
    const colLabel = seatLabels[seat.column - 1];
    const seatLabel = `${seat.row}${colLabel}`;
    const listItem = document.createElement('li');
    listItem.textContent = `Passenger ${index + 1}: ${seatLabel}`;
    chosenSeatsList.appendChild(listItem);
  });
}
