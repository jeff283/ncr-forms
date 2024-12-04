let qualityForm, engineeringForm, ncrID;

// Function to fetch and populate quality form data for viewing
function fetchQualityForm(qualFormID) {
    let productData; let nonconformingData;
    
    fetch(`/api/qualityForms/${qualFormID}`)
        .then(response => response.json())
        .then(qualityFormData => {
            if (qualityFormData.qualFormSupplierProcess !== null) {
                document.getElementById('rfecInsp').checked = true;
            }
            if (qualityFormData.qualFormProductionProcess !== null) {
                document.getElementById('wip').checked = true;
            }
            document.getElementById('sales-order-no').value = qualityFormData.qualSalesOrderNo;
            document.getElementById('quantity-received').value = qualityFormData.qualQtyReceived;
            document.getElementById('quantity-defective').value = qualityFormData.qualQtyDefective;
            document.getElementById('description-item').value = qualityFormData.qualItemDesc;
            document.getElementById('description-defect').value = qualityFormData.qualIssueDesc;

            if (qualityFormData.qualItemNonConforming === 1) {
                document.querySelector('input[name="item-nonconforming"][value="1"]').checked = true;
            } else {
                document.querySelector('input[name="item-nonconforming"][value="0"]').checked = true;
            }

            fetch(`/api/employees${qualityFormData.qualRepID}`)
                .then(response => response.json())
                .then(empData => {
                    document.getElementById('quality-rep-name').value = `${empData.empFirst} ${empData.empLast}`;
                })

            document.getElementById('quality-rep-date').value = qualityFormData.qualDate;

            // First fetch NCR data
            return fetch(`/api/ncrForms/${ncrID}`);
        })
        .then(response => response.json())
        .then(ncrData => {
            // Fetch product data based on the prodID from NCR data
            nonconformingData = ncrData;
            return fetch(`/api/products/${ncrData.prodID}`);
        })
        .then(response => response.json())
        .then(prodData => {
            // Now prodData is available here, so set the supplier name
            document.getElementById('supplier-name').value = prodData.supID;
            productData = prodData;

            // Now fetch all products and populate the dropdown list
            return fetch(`/api/products`);
        })
        .then(response => response.json())
        .then(products => {

            // Call populateProductDropDownLists here, passing the proper parameters
            populateProductDropDownLists(products, productData.supID); // use prodData here since it is still valid

            // Set the product order number (po-prod-no) from NCR data
            document.getElementById('po-prod-no').value = nonconformingData.prodID;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            //alert('Failed to load data.');
        });
}

// Function to fetch and populate engineering form data for viewing
function fetchEngineeringForm(engFormID) {
    fetch(`/api/engineerForms/${engFormID}`)
        .then(response => response.json())
        .then(engFormData => {
            switch (engFormData.engReview) {
                case "Use As Is": document.querySelector('input[name="review-by-engineer"][value="Use As Is"]').checked = true;
                    break;
                case "Repair": document.querySelector('input[name="review-by-engineer"][value="Repair"]').checked = true;
                    break;
                case "Rework": document.querySelector('input[name="review-by-engineer"][value="Rework"]').checked = true;
                    break;
                case "Scrap": document.querySelector('input[name="review-by-engineer"][value="Scrap"]').checked = true;
                    break;
            }

            document.getElementById('disposition').value = engFormData.engDispositionDesc;
            document.getElementById('original-rev-number').value = engFormData.engRevisionNo;
            document.getElementById('updated-rev-number').value = engFormData.engUpdatedRevisionNo;
            document.getElementById('engineering').value = `${engFormData.engFirstName} ${engFormData.engLastName}`;
            document.getElementById('revision-date').value = engFormData.engUpdatedRevisionDate;
            document.getElementById('engineer-date').value = engFormData.engDate;
        })
        .catch(error => {
            console.error('Error fetching engineering form:', error);
            alert('Failed to load engineering form.');
        });
}

// Function to fetch and populate NCR data
async function populateNCRInputs(ncrFormID) {
    fetch(`/api/ncrForms/${ncrFormID}`)
        .then(response => response.json())
        .then(ncrForm => {
            document.getElementById('ncr-no').value = ncrForm.ncrFormNo;
            document.getElementById('ncr-date').value = ncrForm.ncrIssueDate;
            sessionStorage.setItem("currentNCRStage", ncrForm.ncrStage);
            formatAndPopulateStage();

            qualityForm = ncrForm.qualFormID;
            engineeringForm = ncrForm.engFormID;

            // Fetch quality form only if it exists
            if (qualityForm) {
                fetchQualityForm(qualityForm);
            }

            // Fetch engineering form only if it exists
            if (engineeringForm) {
                fetchEngineeringForm(engineeringForm);
            }
        })
        .catch(error => {
            console.error('Error fetching NCR form:', error);
            alert('Failed to load NCR form.');
        });
}

// Function to format and populate stage
function formatAndPopulateStage() {
    switch (sessionStorage.getItem('currentNCRStage')) {
        case "QUA":
            document.getElementById('stage').value = "Quality";
            break;
        case "ENG":
            document.getElementById('stage').value = "Engineering";
            break;
        case "PUR":
            document.getElementById('stage').value = "Purchasing";
            break;
        default:
            document.getElementById('stage').value = "Unknown";
    }
}

// Event listener for DOMContentLoaded to initialize the page
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const ncrFormID = urlParams.get('ncrFormID');  
    if (ncrFormID) {
        populateNCRInputs(ncrFormID);
        ncrID = ncrFormID;
    }

    // Disable create buttons
    const createQualBtn = document.getElementById('submit-quality-btn');
    const createEngBtn = document.getElementById('submit-engineering-btn');

    if(sessionStorage.getItem("mode") === "view"){
        createQualBtn.remove();
        createEngBtn.remove();
    }
});
