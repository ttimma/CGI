package com.example.CGI.Services;

import com.example.CGI.DTOs.Seat;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SeatService {
    private final int ROWS = 28;     // Number of rows for an A320, for example.
    private final int COLUMNS = 6;   // For columns A-F.

    // Mapping between a flight number and its seat map (represented as a 2D array of Seat).
    private Map<String, Seat[][]> flightSeatMaps = new HashMap<>();

    /**
     * Initializes and stores a seat map for the given flight number.
     * @param flightNumber The flight identifier.
     * @return The generated 2D array of Seat objects.
     */
    public Seat[][] initializeSeatMapForFlight(String flightNumber) {
        Seat[][] seats = new Seat[ROWS][COLUMNS];
        Random random = new Random();

        for (int i = 0; i < ROWS; i++) {
            for (int j = 0; j < COLUMNS; j++) {
                boolean isTaken = random.nextDouble() < 0.3; // 30% chance the seat is taken.
                int realRowNumber = i + 1; // 1-based row numbering.
                boolean hasExtraLegroom = (realRowNumber == 11 || realRowNumber == 12);
                int realColumnNumber = j + 1; // 1-based column numbering.
                boolean isWindow = (realColumnNumber == 1 || realColumnNumber == COLUMNS);
                boolean isAisle = (realColumnNumber == 3 || realColumnNumber == 4);

                seats[i][j] = new Seat(
                        realRowNumber,
                        realColumnNumber,
                        isTaken,
                        hasExtraLegroom,
                        isWindow,
                        isAisle
                );
            }
        }
        flightSeatMaps.put(flightNumber, seats);
        return seats;
    }

    /**
     * Retrieves the seat map for a given flight. If no seat map exists for the flight,
     * a new one is initialized.
     * @param flightNumber The flight identifier.
     * @return The seat map as a 2D array of Seat objects.
     */
    public Seat[][] getSeatMapForFlight(String flightNumber) {
        Seat[][] seats = flightSeatMaps.get(flightNumber);
        if (seats == null) {
            seats = initializeSeatMapForFlight(flightNumber);
        }
        return seats;
    }

    /**
     * Converts the 2D seat map into a list of Seat objects.
     * @param flightNumber The flight identifier.
     * @return A list of all seats for the flight.
     */
    public List<Seat> getSeatsForFlight(String flightNumber) {
        Seat[][] seats = getSeatMapForFlight(flightNumber);
        List<Seat> seatList = new ArrayList<>();
        for (Seat[] row : seats) {
            seatList.addAll(Arrays.asList(row));
        }
        return seatList;
    }

    /**
     * Books a seat on a specific flight using 1-based row and column numbers.
     * @param flightNumber The flight identifier.
     * @param row The row number (1-based).
     * @param col The column number (1-based).
     * @return true if the booking is successful, false otherwise.
     */
    public boolean bookSeat(String flightNumber, int row, int col) {
        Seat[][] seats = getSeatMapForFlight(flightNumber);
        int i = row - 1;
        int j = col - 1;
        // Check bounds.
        if (i < 0 || i >= ROWS || j < 0 || j >= COLUMNS) {
            return false; // Out of bounds.
        }
        Seat seat = seats[i][j];
        if (!seat.isTaken()) {
            seat.setTaken(true);
            return true;
        }
        return false;
    }

    /**
     * Recommends seats on a specific flight based on the user's preferences.
     * @param flightNumber The flight identifier.
     * @param numberOfSeats The number of seats required.
     * @param preferWindow True if window seats are preferred.
     * @param preferExtraLegroom True if extra legroom is preferred.
     * @param preferAisle True if aisle seats are preferred.
     * @return A list of recommended Seat objects.
     */
    public List<Seat> recommendSeats(String flightNumber, int numberOfSeats, boolean preferWindow, boolean preferExtraLegroom, boolean preferAisle) {
        Seat[][] seats = getSeatMapForFlight(flightNumber);
        List<Seat> recommendedSeats = new ArrayList<>();

        if (numberOfSeats > 1) {
            // Try to find consecutive available seats in the same row.
            for (int i = 0; i < ROWS; i++) {
                List<Seat> potentialSeats = new ArrayList<>();
                for (int j = 0; j < COLUMNS; j++) {
                    Seat seat = seats[i][j];
                    if (!seat.isTaken() && matchesPreferences(seat, preferWindow, preferExtraLegroom, preferAisle)) {
                        potentialSeats.add(seat);
                        if (potentialSeats.size() == numberOfSeats) {
                            recommendedSeats.addAll(potentialSeats);
                            return recommendedSeats;
                        }
                    } else {
                        // Reset the consecutive check if a seat is taken or doesn’t match.
                        potentialSeats.clear();
                    }
                }
            }
        } else {
            // For a single seat recommendation, gather all available seats that match preferences.
            List<Seat> availableSeats = new ArrayList<>();
            for (Seat[] rowArr : seats) {
                for (Seat seat : rowArr) {
                    if (!seat.isTaken() && matchesPreferences(seat, preferWindow, preferExtraLegroom, preferAisle)) {
                        availableSeats.add(seat);
                    }
                }
            }
            // Sort the available seats based on a scoring function (lower score is a better match).
            availableSeats.sort((s1, s2) ->
                    Double.compare(seatScore(s1, preferWindow, preferExtraLegroom, preferAisle),
                            seatScore(s2, preferWindow, preferExtraLegroom, preferAisle))
            );
            if (!availableSeats.isEmpty()) {
                recommendedSeats.add(availableSeats.get(0));
            }
        }
        return recommendedSeats;
    }

    // ------------------- Helper Methods -------------------

    /**
     * Checks if a seat matches the given preferences.
     */
    private boolean matchesPreferences(Seat seat, boolean preferWindow, boolean preferExtraLegroom, boolean preferAisle) {
        if (preferWindow && !seat.isWindow()) return false;
        if (preferExtraLegroom && !seat.isExtraLegroom()) return false;
        if (preferAisle && !seat.isAisle()) return false;
        return true;
    }

    /**
     * Calculates a score for a seat based on preferences.
     * Lower score indicates a better match.
     */
    private double seatScore(Seat seat, boolean preferWindow, boolean preferExtraLegroom, boolean preferAisle) {
        double score = 0;
        if (preferWindow) {
            score += seat.isWindow() ? 0 : 10;
        }
        if (preferExtraLegroom) {
            score += seat.isExtraLegroom() ? 0 : 5;
        }
        if (preferAisle) {
            score += seat.isAisle() ? 0 : 4;
        }
        return score;
    }
}
