// Function to populate the supplier select dropdown
async function populateSupplierSelect() {
    const supplierSelect = document.getElementById('supplier-name');

    try {
        const response = await fetch('/api/suppliers');
        if (!response.ok) {
            throw new Error('Failed to fetch suppliers');
        }

        const suppliers = await response.json();

        // Clear existing options
        supplierSelect.innerHTML = '<option value="">Select a Supplier</option>'; // Placeholder option

        // Populate the select dropdown with suppliers
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.supID; 
            option.textContent = supplier.supName; 
            supplierSelect.appendChild(option);
        });
    } catch (error) {
        console.error(error);
        //showErrorModal(error.message); // Display error message if fetching fails
    }
}

// Call the function when the DOM is loaded
document.addEventListener('DOMContentLoaded', populateSupplierSelect);