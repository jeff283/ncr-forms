let qualityForm, engineeringForm, purchasingForm, ncrID;

// Function to fetch and populate quality form data
function fetchQualityForm(qualFormID) {
    fetch(`/api/qualityForms/${qualFormID}`)
        .then(response => response.json())
        .then(async qualityFormData => {
            if (qualityFormData.qualFormSupplierProcess !== null) {
                document.getElementById('recInsp').checked = true;
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

            document.getElementById('quality-rep-name').value = await getAndPopulateEmp(qualityFormData.qualRepID);
            document.getElementById('quality-rep-date').value = qualityFormData.qualDate;
        })
        .catch(error => {
            console.error('Error fetching quality form:', error);
            alert('Failed to load quality form.');
        });
}

// Function to fetch engineering form data
function fetchEngineeringForm(engFormID) {
    fetch(`/api/engineerForms/${engFormID}`)
        .then(response => response.json())
        .then(async engFormData => {
            switch(engFormData.engReview){
                case "Use As Is": document.querySelector('input[name="review-by-engineer"][value="Use As Is"]').checked = true; break;
                case "Repair": document.querySelector('input[name="review-by-engineer"][value="Repair"]').checked = true; break;
                case "Rework": document.querySelector('input[name="review-by-engineer"][value="Rework"]').checked = true; break;
                case "Scrap": document.querySelector('input[name="review-by-engineer"][value="Scrap"]').checked = true; break;
            }

            switch(engFormData.engCustNotification){
                case 1: document.querySelector('input[name="require-notification"][value="1"]').checked = true; break;
                case 0: document.querySelector('input[name="require-notification"][value="0"]').checked = true; break;
            }

            document.getElementById('disposition').value = engFormData.engDispositionDesc;

            switch(engFormData.engDrawingUpdate){
                case 1: document.querySelector('input[name="require-updating"][value="1"]').checked = true; break;
                case 0: document.querySelector('input[name="require-updating"][value="0"]').checked = true; break;
            }

            document.getElementById('original-rev-number').value = engFormData.engRevisionNo;
            document.getElementById('updated-rev-number').value = engFormData.engUpdatedRevisionNo;
            document.getElementById('engineering').value = await getAndPopulateEmp(engFormData.engID);
            document.getElementById('revision-date').value = engFormData.engUpdatedRevisionDate;
            document.getElementById('engineer-date').value = engFormData.engDate;
        })
        .catch(error => {
            console.error('Error fetching engineering form:', error);
            alert('Failed to load engineering form.');
        });
}

//Function to fetch purchasing form data
function fetchPurchasingForm(purFormID) {
    fetch(`/api/purchasingForms/${purFormID}`)  // Correct route is 'purchasingForms', not 'purchasingForm'
    .then(response => response.json())
    .then(async purFormData => {
        // LOGIC TO POPULATE INPUTS BASED ON EXISTING DATA
        console.log(purFormData); // Example: logging fetched data for debugging
        // Populate form inputs based on purFormData
        document.getElementById('car-number').value = purFormData.purCarNo;
        document.getElementById('purchasing-followup').value = purFormData.purFollowUpType;
        document.getElementById('purchasing-followup-date').value = purFormData.purFollowUpDate;
        document.getElementById('purchasing-date').value = purFormData.purNCRClosingDate;
        // Check radio buttons (for example)
        document.querySelector(`input[name="preliminary-decision"][value="${purFormData.purDescription}"]`).checked = true;
        document.querySelector(`input[name="car-raised"][value="${purFormData.purCarRaised}"]`).checked = true;
        document.querySelector(`input[name="follow-up-required"][value="${purFormData.purFollowUpReq}"]`).checked = true;
    })
    .catch(error => {
        console.error('Error fetching purchasing form:', error);
        alert('Failed to load purchasing form.');
    });
}

// Function to fetch supplier ID based on product ID
async function getSupplierID(prodID) {
    return fetch(`/api/products/${prodID}`)
        .then(response => response.json())
        .then(product => product.supID)
        .catch(error => console.error('Error fetching product:', error));
}

// Function to populate NCR inputs
async function populateNCRInputs(ncrFormID) {
    fetch(`/api/ncrForms/${ncrFormID}`)
        .then(response => response.json())
        .then(async ncrForm => {
            document.getElementById('ncr-no').value = ncrForm.ncrFormNo;
            document.getElementById('ncr-date').value = ncrForm.ncrIssueDate;
            sessionStorage.setItem("currentNCRStage", ncrForm.ncrStage);
            formatAndPopulateStage();
            qualityForm = ncrForm.qualFormID;
            engineeringForm = ncrForm.engFormID;
            purchasingForm = ncrForm.purFormID;
            ncrID = ncrForm.ncrFormID;
            setSupplierAndTriggerChange(await getSupplierID(ncrForm.prodID));
            document.getElementById('po-prod-no').value = ncrForm.prodID;
            
            if (qualityForm) {
                fetchQualityForm(qualityForm);
            }
            
            if (engineeringForm) {
                fetchEngineeringForm(engineeringForm);
            }

            if(purchasingForm){
                fetchPurchasingForm(purchasingForm);
            }
        })
        .catch(error => {
            console.error('Error fetching NCR form:', error);
            alert('Failed to load NCR form.');
        });
}

// Function to get and populate employee name based on empID
async function getAndPopulateEmp(empID) {
    return fetch(`/api/employees/${empID}`)
        .then(response => response.json())
        .then(employee => `${employee.empFirst} ${employee.empLast}`)
        .catch(error => {
            console.error('Error fetching employee', error);
        });
}

// Function to format and populate stage based on session data
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
    }
}

// Initial setup on page load
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const ncrFormID = urlParams.get('ncrFormID');  
    if (ncrFormID) {
        populateNCRInputs(ncrFormID);
    }

    // Make create buttons say "Update"
    const createQualBtn = document.getElementById('submit-quality-btn');
    const createEngBtn = document.getElementById('submit-engineering-btn');
    createQualBtn.innerText = "Update Quality Form";
    createEngBtn.innerText = "Update Engineering Form";
});

// Function which handles supplier process
function getSupplierProcess(){
    if(document.getElementById('recInsp').checked){
        return "SUP";
    } else return null;
}

//Function which handles production process
function getProductionProcess(){
    if(document.getElementById('wip').checked){
        return "WIP";
    } else return null;
}

const submitQuaBtn = document.getElementById('submit-quality-btn');
// Submit button for quality form update
submitQuaBtn.addEventListener('click', async function(event) {
    event.preventDefault();
    const updatedQualityData = {
        qualFormID: qualityForm,  
        qualFormSupplierProcess: getSupplierProcess(),
        qualFormProductionProcess: getProductionProcess(),
        qualItemDesc: document.getElementById('description-item').value,
        qualIssueDesc: document.getElementById('description-defect').value,
        qualItemID: Number(document.getElementById('po-prod-no').value), 
        qualSalesOrderNo: Number(document.getElementById('sales-order-no').value),
        qualQtyReceived: Number(document.getElementById('quantity-received').value), 
        qualQtyDefective: Number(document.getElementById('quantity-defective').value), 
        qualItemNonConforming: Number(document.querySelector('input[name="item-nonconforming"]:checked').value), 
        qualRepID: Number(sessionStorage.getItem('empID')),
        qualDate: document.getElementById('quality-rep-date').value
    };

    console.log("Updated data being sent:", updatedQualityData);
    
    fetch(`/api/qualityForms/${updatedQualityData.qualFormID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQualityData),
    })
    .then(response => {
        if (response.ok) {
            alert('Successful update on quality data');
        } else {
            response.json().then(data => alert(`Failure updating quality data: ${data.message || 'Unknown error'}`));
        }
    })
    .catch(error => {
        console.error('Error updating quality assurance form:', error);
        alert('An error occurred while updating the quality form');
    });

    const ncrFormNo = document.getElementById('ncr-no').value.replace(/\D/g, '');
});

const submitEngBtn = document.getElementById('submit-engineering-btn');
submitEngBtn.addEventListener('click', async function(event) {
    event.preventDefault();

    console.log("engineering form" + engineeringForm);

    // Check if there is an existing engineering form to update or create a new one
    let currentEngFormID = engineeringForm;

    const formData = { 
        engReview: document.querySelector('input[name="review-by-engineer"]:checked').value, 
        engCustNotification: Number(document.querySelector('input[name="require-notification"]:checked').value), 
        engDispositionDesc: document.getElementById('disposition').value, 
        engDrawingUpdate: Number(document.querySelector('input[name="require-updating"]:checked').value), 
        engRevisionNo: document.getElementById('original-rev-number').value, 
        engUpdatedRevisionNo: document.getElementById('updated-rev-number').value,
        engID: Number(sessionStorage.getItem('empID')),
        engUpdatedRevisionDate: document.getElementById('revision-date').value,
        engDate: document.getElementById('engineer-date').value 
    };

    try {
        if (currentEngFormID) {
            // If engineering form ID exists, update the existing form
            const response = await fetch(`/api/engineerForms/${currentEngFormID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Engineering form updated successfully');
            } else {
                alert('Error updating engineering form');
            }
        } else {
            // If no engineering form ID exists, create a new form
            const response = await fetch(`/api/engineerForms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const newEngForm = await response.json();
                const newEngFormID = newEngForm.engFormID;

                const ncrFormID = ncrID;  
                const updatedNCRData = { engFormID: newEngFormID, ncrStage: "PUR" };

                // Update the NCR form with the new engineering form ID
                const updateResponse = await fetch(`/api/ncrForms/${ncrFormID}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedNCRData),
                });

                if (updateResponse.ok) {
                    alert('Engineering form created and NCR form updated successfully');

                    //location.reload();

                    // Send email only if the form is newly created
                    const ncrFormNo = document.getElementById('ncr-no').value.replace(/\D/g, '');
                    await notifyDepartmentManager(ncrFormNo, "Purchasing");
                } else {
                    alert('Error updating NCR form with engineering form ID');
                    console.error('Error updating NCR form:', updateResponse);
                }
            } else {
                alert('Error creating engineering form');
            }
        }
    } catch (error) {
        alert('Error processing the form: ' + error);
        console.error('Error processing the form:', error);
    }
});

const submitPurBtn = document.getElementById('submit-purchasing-btn');
submitPurBtn.addEventListener('click', async function (event) {
    event.preventDefault();

    console.log("purchasing form", purchasingForm);

    // Determine if we are updating an existing purchasing form
    const currentPurFormID = purchasingForm ? purchasingForm.purFormID : null;

    // Collect form data
    const formData = {
        purFormID: await getPurchasingFormID(), // Get or generate the form ID
        purDescription: document.querySelector('input[name="preliminary-decision"]:checked').value,
        purCarRaised: Number(document.querySelector('input[name="car-raised"]:checked').value),
        purCarNo: Number(document.getElementById('car-number').value) || null,
        purFollowUpReq: Number(document.querySelector('input[name="follow-up-required"]:checked').value),
        purFollowUpType: document.getElementById('purchasing-followup').value || null,
        purFollowUpDate: document.getElementById('purchasing-followup-date').value || null,
        purInspectorID: Number(sessionStorage.getItem('empID')),
        purNCRClosingDate: document.getElementById('purchasing-date').value,
    };

    try {
        if (currentPurFormID) {
            // Update existing purchasing form
            const response = await fetch(`/api/purchasingForms/${currentPurFormID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Purchasing form updated successfully');
            } else {
                alert('Error updating purchasing form');
            }
        } else {
            // Create a new purchasing form
            const response = await fetch(`/api/purchasingForms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const newPurForm = await response.json();
                console.log("Full response from API:", newPurForm); 
                
                const newPurFormID = newPurForm.purFormID; 
                console.log("New Purchasing Form ID:", newPurFormID); 

                console.log(newPurFormID);

                // Update the NCR form with the new purchasing form ID
                const ncrFormID = ncrID; 
                const updatedNCRData = { purFormID: newPurFormID, ncrStage: "ARC", ncrStatusID: 2 };

                const updateResponse = await fetch(`/api/ncrForms/${ncrFormID}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedNCRData),
                });

                if (updateResponse.ok) {
                    alert('Purchasing form created and NCR form updated successfully');

                    // Optionally reload the page
                    location.reload();

                    // Notify the department manager
                    const ncrFormNo = document.getElementById('ncr-no').value.replace(/\D/g, '');
                    await notifyDepartmentManager(ncrFormNo, "");
                } else {
                    alert('Error updating NCR form with purchasing form ID');
                    console.error('Error updating NCR form:', await updateResponse.json());
                }
            } else {
                alert('Error creating purchasing form');
                console.error('Error response:', await response.json());
            }
        }
    } catch (error) {
        alert('Error processing the form: ' + error.message);
        console.error('Error processing the form:', error);
    }
});

// Function which ghenerates the existing purchasing form ID
async function getPurchasingFormID(status) {
    if(status === "UPDATE"){
        // Return the existing form ID fromt he databse or from the user input if updating
        const ncrNo = document.getElementById('ncr-no').value.replace(/\D/g, '');
        try{
            const response = await fetch(`/api/purchasingForms/${ncrNo}`) 

            if(!response.ok){
                throw new Error('Form not found for update.');
            }

            const data = await response.json();
            return data.purFormID;
        } catch(error){
            console.error('Error fetching purchasing form for update: ', error);
            throw error;
        }
    }
    else{
        // Generate the new form ID
        try{
            const response = await fetch('/api/purchasingForms');

            if(!response.ok){
                throw new Error('Network response was not ok.');
            }

            const data = await response.json();
            return data.length + 1;
        }
        catch(error){
            console.error('Error generating new purchasing form ID', error);
            throw error;
        }
    }
}

async function notifyDepartmentManager(ncrFormNo, department) {
    const recipient = "andrewdionne09@gmail.com"; 
    const subject = `Form Update Required: Form ${ncrFormNo}`;
    const message = `
NCR Form ${ncrFormNo} is now ready for updating in the ${department} department. 

Please review and proceed with the necessary actions at your earliest convenience.
`;

    try {
        const response = await fetch('/api/email/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipient,
                subject,
                message
            }),
        });

        const result = await response.json();
        if (response.ok) {
            console.log('Email sent successfully:', result);
        } else {
            console.error('Error sending email:', result.error);
        }
    } catch (error) {
        console.error('An unexpected error occurred:', error);
    }

    
    const notificationMessage = `NCR Form ${ncrFormNo} in the ${department} department requires your attention.`;
            
    let empID;
    
    switch(department){
        case "Engineering": empID = 2; break;
        case "Purchasing": empID = 3; break;
    }

    // Add a new notification for the employee
    const notificationResponse = await fetch('/api/notifications/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: empID, 
            message: notificationMessage,
            ncrFormID: ncrID
        }),
    });

    const notificationResult = await notificationResponse.json();
    if (notificationResponse.ok) {
        console.log('Notification added successfully:', notificationResult);
    } else {
        console.error('Error adding notification:', notificationResult.error);
    }


}

//Eventlisteners for "Does the drawing require updating" to show or not show fields (defaults to no)
document.getElementById('require-updating-yes').addEventListener('change', function(){
    document.getElementById('revision-info').style.display = "";
});

document.getElementById('require-updating-no').addEventListener('change', function(){
    document.getElementById('revision-info').style.display = "none";
});

//Eventlisteners for "CAR number entry"
document.getElementById('car-yes').addEventListener('change', function(){
    document.getElementById('car-info').style.display = "";
});

document.getElementById('car-no').addEventListener('change', function(){
    document.getElementById('car-info').style.display = "none";
});

//Eventlisteners for "Follow up required"
document.getElementById('followup-yes').addEventListener('change', function(){
    document.getElementById('followup-info').style.display = "";
});

document.getElementById('followup-no').addEventListener('change', function(){
    document.getElementById('followup-info').style.display = "none";
});