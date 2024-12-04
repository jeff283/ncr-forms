// Function to fetch positions and populate the select dropdown
async function populatePositionSelect() {
    try {
        const response = await fetch('/api/positions');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const positions = await response.json();
        const positionSelect = document.getElementById('position');

        // Clear existing options
        positionSelect.innerHTML = '';

        // Populate the select dropdown with positions
        positions.forEach(position => {
            const option = document.createElement('option');
            option.value = position.posID; // Use posID as the value
            option.textContent = position.posDescription; // Display the title
            positionSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching positions:', error);
    }
}

// Call the function on page load
document.addEventListener('DOMContentLoaded', populatePositionSelect);