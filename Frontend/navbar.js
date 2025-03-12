document.addEventListener("DOMContentLoaded", function() {
    // Wait for the DOM to be fully loaded before executing the code
  
    // Fetch the navbar markup from "navbar.html"
    fetch('navbar.html')
      .then(response => {
        // Check if the HTTP response is OK (status in the range 200-299)
        if (!response.ok) {
          // If not, throw an error to be caught by the catch block
          throw new Error("Network response was not ok");
        }
        // Convert the response body to text (HTML markup)
        return response.text();
      })
      .then(html => {
        // Once the HTML is retrieved, insert it into the element with ID 'navbar-container'
        document.getElementById('navbar-container').innerHTML = html;
      })
      .catch(error => {
        // Log any errors encountered during the fetch or insertion process
        console.error("Error loading navbar:", error);
      });
  });
  