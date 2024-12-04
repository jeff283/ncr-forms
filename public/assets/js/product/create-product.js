let errorList = [];

const successModal = new bootstrap.Modal(document.getElementById('successModal'));
const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));

function validateInputs(event){
    event.preventDefault();

    errorList = [];

    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value.trim();
    const supplier = document.getElementById('supplier-name').value;

    let isValid = true;

    if(!name || !category || !supplier){
        errorList.push('Please make sure all the fields are filled out.');
        isValid = false;
    }

    if(isValid){
        createProduct();
        document.getElementById('successModalBody').innerText = 'New product created successfully!';
        successModal.show();
        const successClick = document.getElementById('btnDismiss');
        successClick.addEventListener('click', e => {
            e.preventDefault();
            window.location.href = "product.html";
        })
    }
    else{
        const errorMessages = errorList.join('\n');
        //alert(`Validation Errors:\n${errorMessages}`) //Temp alert for testing
        document.getElementById('errorModalBody').innerText = `Validation Errors:\n${errorMessages}`;
        errorModal.show();
    }
}

async function createProduct() {
    const productName = document.getElementById('product-name').value.trim();
    const productCategory = document.getElementById('product-category').value.trim();
    const supplierId = document.getElementById('supplier-name').value;

    const API_URL = '/api/products'; 

    // Basic validation
    if (!productName || !productCategory || !supplierId) {
        // Display error modal for empty fields
        showErrorModal('Please fill in all fields.');
        return;
    }

    const productData = {
        prodName: productName,   
        prodCategory: productCategory, 
        supID: parseInt(supplierId, 10),
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.message || 'Failed to create product');
        }

        
    } catch (error) {
        
    }
}

// Set up event listener for the submit button
document.getElementById('btnSubmit').addEventListener('click', validateInputs);