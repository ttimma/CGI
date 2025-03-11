package com.example.CGI.Controllers;

import com.example.CGI.DTOs.Seat;
import com.example.CGI.Services.SeatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seats")
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
    public String bookSeat(@RequestBody Map<String, Integer> request) {
        int row = request.get("row");
        int col = request.get("col");
        boolean success = seatService.bookSeat(row, col);
        return success ? "Seat booked successfully" : "Seat already taken";
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
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(recommendations);
    }
}
