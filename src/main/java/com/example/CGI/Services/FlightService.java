package com.example.CGI.Services;

import com.example.CGI.DTOs.Flight;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class FlightService {
    private final Random random = new Random();

    // Generate and return all flights
    public List<Flight> getAllFlights() {
        List<Flight> flights = new ArrayList<>();
        String[] destinations = {"New York", "Los Angeles", "London", "Berlin", "Paris", "Tokyo", "Amsterdam", "Rome", "Barcelona", "Stockholm"};
        double[] basePrices = {450.0, 490.0, 150.0, 120.0, 200.0, 550.0, 180.0, 210.0, 220.0, 105.0};
        int flightNumber = 37;
        for (int i = 0; i < destinations.length; i++) {
            for (int j = 0; j < 10; j++) {
                LocalDateTime departureTime = generateRandomDepartureTime();
                flights.add(new Flight("TLL" + flightNumber++, destinations[i],
                        departureTime,
                        basePrices[i] + (j * 10)));
            }
        }
        return flights;
    }

    // Filter flights by destination
    public List<Flight> getFlightsByDestination(String destination) {
        List<Flight> flights = new ArrayList<>();
        for (Flight flight : getAllFlights()) {
            if (flight.getDestination().equalsIgnoreCase(destination)) {
                flights.add(flight);
            }
        }
        flights.sort(Comparator.comparing(Flight::getDepartureTime));
        return flights;
    }

    // Filter flights by date
    public List<Flight> getFlightsByDate(String date) {
        List<Flight> flights = new ArrayList<>();
        for (Flight flight : getAllFlights()) {
            if (flight.getDepartureTime().toLocalDate().toString().equals(date)) {
                flights.add(flight);
            }
        }
        return flights;
    }

    // Filter flights by both destination and date
    public List<Flight> getFlightsByDestinationAndDate(String destination, String date) {
        List<Flight> flights = new ArrayList<>();
        for (Flight flight : getAllFlights()) {
            if (flight.getDestination().equalsIgnoreCase(destination) &&
                    flight.getDepartureTime().toLocalDate().toString().equals(date)) {
                flights.add(flight);
            }
        }
        return flights;
    }

    // Helper method to generate a random departure time
    private LocalDateTime generateRandomDepartureTime() {
        int year = 2025 + random.nextInt(2); // 2025 or 2026
        int month = random.nextInt(9) + 4;     // April to December
        int dayOfMonth = random.nextInt(28) + 1;
        int hour = random.nextInt(24);
        int minute = random.nextInt(60);
        return LocalDateTime.of(year, month, dayOfMonth, hour, minute);
    }
}
