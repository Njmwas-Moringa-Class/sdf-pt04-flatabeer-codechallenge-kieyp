// When the webpage is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Base URL for API requests
  const baseURL = 'http://localhost:3000';
  // Current ID of the beer being displayed
  let currentBeerId = 1;

  // Get HTML elements for beer list and details
  const beerList = document.getElementById('beer-list');
  const beerDetails = document.querySelector('.beer-details');

  // Function to fetch data from the API
  const fetchData = async (url, errorMessage) => {
    try {
      // Fetch data from the provided URL
      const response = await fetch(url);
      // If response is not successful, handle error
      if (!response.ok) {
        throw new Error(errorMessage);
      }
      // Parse response as JSON and return data
      return await response.json();
    } catch (error) {
      // Log errors
      console.error(`Error: ${errorMessage}`, error);
    }
  };

  // Function to fetch beers from the API
  const fetchBeers = async () => {
    // Fetch beers from the API
    const beers = await fetchData(`${baseURL}/beers`, 'Error fetching beers');
    // If data is fetched successfully, display beers and details
    if (beers) {
      displayBeersAndDetails(beers);
    }
  };

  // Function to fetch beer details for a specific ID from the API
  const fetchBeerDetails = async (id) => {
    // Fetch beer details for the specified ID from the API
    const beer = await fetchData(`${baseURL}/beers/${id}`, `Error fetching beer details for ID ${id}`);
    // If data is fetched successfully, display beer details
    if (beer) {
      displayBeerDetails(beer);
    }
  };

  // Function to display list of beers and their details
  const displayBeersAndDetails = (beers) => {
    // Clear the beer list
    beerList.innerHTML = '';
    // Add beers to the list
    beers.forEach(beer => addBeerToList(beer));
    // Fetch and display details for the current beer ID
    fetchBeerDetails(currentBeerId);
  };

  // Function to add a beer to the beer list
  const addBeerToList = (beer) => {
    // Create a new list item for the beer
    const li = document.createElement('li');
    // Set the name of the beer as the text
    li.textContent = beer.name;
    // When clicked, display details of the selected beer
    li.addEventListener('click', () => {
      currentBeerId = beer.id;
      fetchBeerDetails(currentBeerId);
    });
    // Add the beer to the list
    beerList.appendChild(li);
  };

  // Function to display beer details
  const displayBeerDetails = (beer) => {
    // Update the beer details section with beer information
    beerDetails.innerHTML = `
      <h2>${beer.name}</h2>
      <img src="${beer.image_url}" alt="${beer.name}" />
      <p><em>${beer.description}</em></p>
      <!-- Form to edit beer description -->
      <form id="description-form">
        <label for="description">Edited Description:</label>
        <textarea id="description">${beer.description}</textarea>
        <button type="submit">Update Beer</button>
      </form>
      <h3>Customer Reviews</h3>
      <ul id="review-list">
        <!-- Display customer reviews -->
        ${beer.reviews.map((review, index) => `
          <li data-index="${index}">${review}</li>`).join('')}
      </ul>
      <!-- Form to add customer reviews -->
      <form id="review-form">
        <label for="review">Your Review:</label>
        <textarea id="review"></textarea>
        <button type="submit">Add review</button>
      </form>
    `;

    // Event listener for editing beer description
    document.getElementById('description-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const newDescription = document.getElementById('description').value;
      // Update beer description
      updateBeer(currentBeerId, { description: newDescription });
    });

    // Event listener for adding customer reviews
    document.getElementById('review-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const newReview = document.getElementById('review').value;
      // Add new customer review
      updateBeer(currentBeerId, { reviews: [...beer.reviews, newReview] });
    });

    // Event listener for deleting customer reviews
    document.getElementById('review-list').addEventListener('click', (event) => {
      if (event.target.tagName === 'LI') {
        const index = event.target.getAttribute('data-index');
        // Delete the selected customer review
        updateBeer(currentBeerId, { reviews: beer.reviews.filter((_, i) => i != index) });
      }
    });
  };

  // Function to update beer details using PATCH request
  const updateBeer = async (id, data) => {
    try {
      // Send a PATCH request to update beer details
      const response = await fetch(`${baseURL}/beers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      // If update is not successful, handle error
      if (!response.ok) {
        throw new Error('Error updating beer');
      }
      // Fetch and display updated beers and details
      fetchBeers();
    } catch (error) {
      // Handle errors and log the error message
      console.error(`Error updating beer with ID ${id}:`, error);
    }
  };

  // Fetch beers when the page is loaded
  fetchBeers();
});
