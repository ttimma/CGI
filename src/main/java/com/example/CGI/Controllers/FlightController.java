package com.example.CGI.Controllers;

import com.example.CGI.DTOs.Flight;
import com.example.CGI.Services.FlightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class FlightController {

    private final FlightService flightService;

    @Autowired
    public FlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    @GetMapping("/flights")
    public ResponseEntity<List<Flight>> getFlights() {
        List<Flight> flights = flightService.getAllFlights();
        return ResponseEntity.ok(flights);
    }

    @GetMapping("/flights/destination/{destination}")
    public ResponseEntity<List<Flight>> getFlightsByDestination(@PathVariable String destination) {
        List<Flight> flights = flightService.getFlightsByDestination(destination);
        // Always return 200 OK even if flights is empty.
        return ResponseEntity.ok(flights);
    }

    @GetMapping("/flights/date/{date}")
    public ResponseEntity<List<Flight>> getFlightsByDate(@PathVariable String date) {
        List<Flight> flights = flightService.getFlightsByDate(date);
        return ResponseEntity.ok(flights);
    }

    @GetMapping("/flights/destination/{destination}/date/{date}")
    public ResponseEntity<List<Flight>> getFlightsByDestinationAndDate(@PathVariable String destination, @PathVariable String date) {
        List<Flight> flights = flightService.getFlightsByDestinationAndDate(destination, date);
        return ResponseEntity.ok(flights);
    }
}
