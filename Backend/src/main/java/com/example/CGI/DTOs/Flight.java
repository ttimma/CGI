package com.example.CGI.DTOs;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public final class Flight {
    private final String flightNumber;
    private final String destination;

    @JsonFormat(pattern="yyyy-MM-dd HH:mm")
    private final LocalDateTime departureTime;
    private final double price;

    public Flight(String flightNumber, String destination, LocalDateTime departureTime, double price) {
        this.flightNumber = flightNumber;
        this.destination = destination;
        this.departureTime = departureTime;
        this.price = price;
    }

    public String getFlightNumber() {
        return flightNumber;
    }
    public String getDestination() {
        return destination;
    }
    public LocalDateTime getDepartureTime() {
        return departureTime;
    }
    public double getPrice() {
        return price;
    }

    @Override
    public String toString() {
        return "Flight {" +
                "flightNumber='" + flightNumber + '\'' +
                ", destination='" + destination + '\'' +
                ", departureTime=" + departureTime +
                ", price=" + price +
                '}';
    }
}