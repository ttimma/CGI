package com.example.CGI.Services;

import com.example.CGI.DTOs.Seat;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SeatService {
    private final int ROWS = 28;   // A320 rows
    private final int COLUMNS = 6; // e.g., columns A-F
    private Seat[][] seats;

    public SeatService() {
        initializeSeats();
    }

    // Initialize seats with 1-based row/column numbers in the Seat object
    private void initializeSeats() {
        seats = new Seat[ROWS][COLUMNS];
        Random random = new Random();

        for (int i = 0; i < ROWS; i++) {
            for (int j = 0; j < COLUMNS; j++) {
                boolean isTaken = random.nextDouble() < 0.3; // 30% chance the seat is taken

                // Use (i+1) as the real row number
                int realRowNumber = i + 1;

                // For example, rows 11 and 12 (i+1 == 11 or 12) have extra legroom
                boolean hasExtraLegroom = (realRowNumber == 11 || realRowNumber == 12);

                // Determine window seat: first and last columns (1 and 6 if columns are 1..6)
                // So if j=0 => column=1 => isWindow, if j=5 => column=6 => isWindow
                int realColumnNumber = j + 1;
                boolean isWindow = (realColumnNumber == 1 || realColumnNumber == COLUMNS);

                // Determine aisle seat: for a 6-seat configuration, columns 3 and 4
                // So if j=2 => column=3 => aisle, if j=3 => column=4 => aisle
                boolean isAisle = (realColumnNumber == 3 || realColumnNumber == 4);

                // Store the seat in the 2D array
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
    }

    public List<Seat> getSeats() {
        List<Seat> seatList = new ArrayList<>();
        for (Seat[] row : seats) {
            seatList.addAll(Arrays.asList(row));
        }
        return seatList;
    }

    // Book a seat using 1-based row/column from the user
    public boolean bookSeat(int row, int col) {
        // Convert to zero-based indices
        int i = row - 1;
        int j = col - 1;

        // Check bounds
        if (i < 0 || i >= ROWS || j < 0 || j >= COLUMNS) {
            return false; // Out of bounds
        }

        Seat seat = seats[i][j];
        if (!seat.isTaken()) {
            seat.setTaken(true);
            return true;
        }
        return false;
    }

    /**
     * Recommend seats based on preferences.
     *
     * @param numberOfSeats      Number of seats requested.
     * @param preferWindow       True if the user prefers window seats.
     * @param preferExtraLegroom True if the user prefers seats with extra legroom.
     * @param preferAisle        True if the user prefers aisle seats.
     * @return A list of recommended Seat objects.
     */
    public List<Seat> recommendSeats(int numberOfSeats, boolean preferWindow, boolean preferExtraLegroom, boolean preferAisle) {
        List<Seat> recommendedSeats = new ArrayList<>();

        // For multiple seats: try to find consecutive available seats in the same row.
        if (numberOfSeats > 1) {
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
                        // If a seat is taken or doesn’t match, reset the consecutive check.
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
            // Sort the available seats based on a scoring function (lower score is a better match)
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

    // Helper method to check if a seat matches the given preferences.
    private boolean matchesPreferences(Seat seat, boolean preferWindow, boolean preferExtraLegroom, boolean preferAisle) {
        if (preferWindow && !seat.isWindow()) return false;
        if (preferExtraLegroom && !seat.isExtraLegroom()) return false;
        if (preferAisle && !seat.isAisle()) return false;
        return true;
    }

    // Helper method to assign a score to a seat based on preferences. Lower score means a better match.
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
