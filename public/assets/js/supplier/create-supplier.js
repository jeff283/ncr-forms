let errorList = [];


 //Define modals
 var errorModal = new bootstrap.Modal(document.getElementById('errorModal'));

 var successModal = new bootstrap.Modal(document.getElementById('successModal'));

function validateInputs(){
    errorList = [];

    const contactName = document.getElementById('supContactName').value.trim();
    const contactEmail = document.getElementById('supContactEmail').value.trim();
    let phone = document.getElementById('supContactPhone').value.trim();
    const name = document.getElementById('supName').value.trim();
    const address = document.getElementById('supAddress').value.trim();
    const city = document.getElementById('supCity').value.trim();
    const country = document.getElementById('supCountry').value.trim();

    let isValid = true;

    if (!contactName || !contactEmail || !phone || !name || !address || !city || !country) {
        errorList.push("Please make sure all the fields are filled out");
        isValid = false;
    }

    phone = phone.replace(/\D/g, ""); // Remove any non-numeric characters
    if (phone.length !== 10) {
        errorList.push("Phone entry is in the incorrect format. Please check entry and try again.");
        isValid = false;
    }

    if(isValid){
        createSupplier();    
    }
    else{
        const errorMessages = errorList.join('\n');
        //alert(`Validation Errors:\n${errorMessages}`) //Temp alert for testing
        document.getElementById('errorModalBody').innerText = `Validation Errors:\n${errorMessages}`;
        errorModal.show();
    }
}

// Function to create a new supplier
async function createSupplier() {
    const supplierData = {
        supContactName: document.getElementById('supContactName').value,
        supContactEmail: document.getElementById('supContactEmail').value,
        supContactPhone: document.getElementById('supContactPhone').value,
        supName: document.getElementById('supName').value,
        supAddress: document.getElementById('supAddress').value,
        supCity: document.getElementById('supCity').value,
        supCountry: document.getElementById('supCountry').value,
    };

    try {
        const response = await fetch('/api/suppliers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(supplierData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();

        document.getElementById('successModalBody').innerText = 'Supplier created successfully!';
        successModal.show();
        
        const successClick = document.getElementById('btnDismiss');
        successClick.addEventListener('click', e => {
            e.preventDefault();
            window.location.href = "supplier.html";
        })

        // Clear the form or redirect as needed
        //document.getElementById('supplier-form').reset();
    } catch (error) {
        console.error('Error creating supplier:', error);
        alert('Failed to create supplier. Please try again.');
    }
}

// Add event listener to the form submission
document.getElementById('supplier-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission
    validateInputs();
});