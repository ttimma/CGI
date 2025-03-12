package com.example.CGI.Controllers;

import com.example.CGI.DTOs.Seat;
import com.example.CGI.Services.SeatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/seats")
public class SeatController {
    private final SeatService seatService;

    public SeatController(SeatService seatService) {
        this.seatService = seatService;
    }

    @GetMapping
    public List<Seat> getSeats() {
        return seatService.getSeats();
    }

    @PostMapping("/book")
    public ResponseEntity<String> bookSeat(@RequestBody Map<String, Integer> request) {
        // Validate that the request body contains the required row and col keys.
        if (request == null || !request.containsKey("row") || !request.containsKey("col")) {
            return ResponseEntity.badRequest().body("Row and column must be provided.");
        }
        Integer row = request.get("row");
        Integer col = request.get("col");
        if (row == null || col == null) {
            return ResponseEntity.badRequest().body("Row and column values cannot be null.");
        }

        // Try to book the seat.
        boolean success = seatService.bookSeat(row, col);
        if (success) {
            return ResponseEntity.ok("Seat booked successfully.");
        } else {
            // Using 409 Conflict to indicate that the seat is already taken.
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Seat already taken.");
        }
    }


    // Endpoint for seat recommendations.
    @GetMapping("/recommend")
    public ResponseEntity<List<Seat>> recommendSeats(
            @RequestParam int numberOfSeats,
            @RequestParam boolean preferWindow,
            @RequestParam boolean preferExtraLegroom,
            @RequestParam boolean preferAisle) {

        List<Seat> recommendations = seatService.recommendSeats(numberOfSeats, preferWindow, preferExtraLegroom, preferAisle);
        if (recommendations.isEmpty()) {
            // Return 404 Not Found if no seats are recommended.
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(recommendations);
    }
}
