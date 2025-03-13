package com.example.CGI.Controllers;

import com.example.CGI.DTOs.Seat;
import com.example.CGI.Services.SeatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/flights/{flightNumber}/seats")
public class SeatController {
    private final SeatService seatService;

    public SeatController(SeatService seatService) {
        this.seatService = seatService;
    }

    /**
     * Return all seats (as a list) for a given flight.
     */
    @GetMapping
    public List<Seat> getSeats(@PathVariable String flightNumber) {
        // Convert the flight's seat map into a list
        return seatService.getSeatsForFlight(flightNumber);
    }

    /**
     * Return the 2D seat array for a given flight (if you still want it).
     * Using "/matrix" or some other path to avoid collision with the list endpoint.
     */
    @GetMapping("/matrix")
    public ResponseEntity<Seat[][]> getSeatMap(@PathVariable String flightNumber) {
        Seat[][] seatMap = seatService.getSeatMapForFlight(flightNumber);
        return ResponseEntity.ok(seatMap);
    }

    /**
     * Book a seat on a given flight.
     */
    @PostMapping("/book")
    public ResponseEntity<String> bookSeat(@PathVariable String flightNumber,
                                           @RequestBody Map<String, Integer> request) {
        // Validate row & col.
        if (request == null || !request.containsKey("row") || !request.containsKey("col")) {
            return ResponseEntity.badRequest().body("Row and column must be provided.");
        }
        Integer row = request.get("row");
        Integer col = request.get("col");
        if (row == null || col == null) {
            return ResponseEntity.badRequest().body("Row and column values cannot be null.");
        }

        // Try to book the seat
        boolean success = seatService.bookSeat(flightNumber, row, col);
        if (success) {
            return ResponseEntity.ok("Seat booked successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Seat already taken.");
        }
    }

    /**
     * Recommend seats for a given flight based on preferences.
     */
    @GetMapping("/recommend")
    public ResponseEntity<List<Seat>> recommendSeats(
            @PathVariable String flightNumber,
            @RequestParam int numberOfSeats,
            @RequestParam boolean preferWindow,
            @RequestParam boolean preferExtraLegroom,
            @RequestParam boolean preferAisle) {

        List<Seat> recommendations = seatService.recommendSeats(
                flightNumber,
                numberOfSeats,
                preferWindow,
                preferExtraLegroom,
                preferAisle
        );

        if (recommendations.isEmpty()) {
            // Return 404 Not Found if no seats are recommended.
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(recommendations);
    }
}
