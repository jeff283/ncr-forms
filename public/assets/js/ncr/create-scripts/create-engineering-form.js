// Function to create or update engineering form
async function createEngineeringForm() {
    const status = await checkNCRValidity();

    let revisionDate;

    // If else ladder which checks against the checked value in the radio button and handles data accordingly so it doesnt display in data if user checks "no"
    if(document.querySelector('input[name="require-updating"]:checked').value === 1) // "Yes" case for "Does the drawing require updating"
    {
        revisionDate = null;
    }
    else{
        revisionDate = document.getElementById('revision-date').value;
    }

    if (status === "VALID" || status === "UPDATE") {
        // Collect inputs
        const engineeringFormData = { 
            engFormID: await getEngineeringFormID(status),  
            engReview: document.querySelector('input[name="review-by-engineer"]:checked').value, 
            engCustNotification: document.querySelector('input[name="require-notification"]:checked').value,
            engDispositionDesc: document.getElementById('disposition').value,
            engDrawingUpdate: document.querySelector('input[name="require-updating"]:checked').value,
            engRevisionNo: document.getElementById('original-rev-number').value || null,
            engUpdatedRevisionNo: document.getElementById('updated-rev-number').value || null,
            engUpdatedRevisionDate: revisionDate,
            engID: sessionStorage.getItem("empID"),
            engDate: document.getElementById('engineer-date').value
        };

        const requiredFields = ['review-by-engineer', 'disposition'];
        let formIsValid = true;

        requiredFields.forEach(field => {
            const input = document.querySelector(`[name="${field}"]`) || document.getElementById(field);
            if (!input || (!input.value.trim() && !input.checked)) {
                formIsValid = false;
                input?.classList.add('error');
            } else {
                input?.classList.remove('error');
            }
        });

        // If form is invalid, stop form submission
        if (!formIsValid) {
            alert('Please fill out all required fields correctly.');
            return; // Prevent form submission
        }

        try {
            const response = await fetch(`/api/engineerForms/${engineeringFormData.engFormID}`, {
                method: status === "UPDATE" ? 'PUT' : 'POST', // Use PUT if updating
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(engineeringFormData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            alert(status === "UPDATE" ? 'Engineering form updated successfully' : 'Engineering form created successfully');

            const ncrFormNo = document.getElementById('ncr-no').value.replace(/\D/g, '');  // Clean NCR form ID
            await notifyDepartmentManager(ncrFormNo, "Purchasing");

        } catch (error) {
            console.error('Error creating or updating engineering form:', error);
            alert('Failed to create or update engineering form. Please try again');
        }
    } else if (status === "ERROR") {
        alert('Unknown error, Please try again and if the issue persists check with administrator');
    } else if (status === "INCOMPLETE") {
        alert('Cannot create or update engineering form. Form is incomplete meaning there is no quality rep entry.\nCheck quality representative entry and try again');
    } else if (status === "INVALID") {
        alert('Cannot create or update engineering form. NCR number is not valid.');
    }
}

async function updateNCR(){
    const ncrNo = document.getElementById('ncr-no').value.replace(/\D/g, '');

    // Stage changed bc quality form should already be created once this is called
    sessionStorage.setItem("currentNCRStage", "PUR"); 

    const ncrData = {
        ncrFormID: Number(ncrFormID),
        ncrFormNo: Number(ncrFormNo),
        qualFormID: Number(qualFormID),
        engFormID: null, //NULL since no eng form has been yet created
        purFormID: null, //NULL sine no pur form has been yet created
        prodID: Number(document.getElementById('po-prod-no').value),
        ncrStatusID: 1, // 1: Open, 2: Closed
        ncrStage: sessionStorage.getItem("currentNCRStage"),
        ncrIssueDate: document.getElementById('quality-rep-date').value
    }

    try{
        const response = await fetch('/api/ncrForms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ncrData)
        });

        if(!response.ok){
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        
        alert('Success creating NCR and Quality Assuance Form. Engineering department has been notified');
    
        await notifyDepartmentManager(ncrFormNo, "Engineering");
    }
    catch(error){
        console.error('Error creating new NCR report:', error);
        alert('Failed to create NCR. Please try again.');
    }

}

// Function to generate or get the existing engineering form ID
async function getEngineeringFormID(status) {
    if (status === "UPDATE") {
        // Return the existing form ID from the database or from user input if updating
        const ncrNo = document.getElementById('ncr-no').value.replace(/\D/g, '');
        try {
            const response = await fetch(`/api/engineerForms/${ncrNo}`); // Fetch existing form based on NCR number

            if (!response.ok) {
                throw new Error('Form not found for update.');
            }

            const data = await response.json();
            return data.engFormID; // Return the existing form ID for updating
        } catch (error) {
            console.error('Error fetching engineering form for update:', error);
            throw error;
        }
    } else {
        // Generate new form ID
        try {
            const response = await fetch('/api/engineerForms');

            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }

            const data = await response.json();
            return data.length + 1; // New form ID based on the existing count
        } catch (error) {
            console.error('Error generating new engineering form ID', error);
            throw error;
        }
    }
}

// Function to handle NCR validity and form status
async function checkNCRValidity() {
    let ncrNo = document.getElementById('ncr-no').value.replace(/\D/g, '');
    
    if (isNaN(ncrNo)) {
        return "INVALID";
    }
    
    try {
        const response = await fetch('/api/ncrForms');
        const ncrData = await response.json();

        const ncrForm = ncrData.find(item => item.ncrFormNo === ncrNo);

        if (!ncrForm) {
            return "INVALID";
        }

        // Check if the quality form is missing
        if (ncrForm.qualFormID === null) {
            return "INCOMPLETE"; // If the quality form is missing
        }
        
        return "VALID"; 
    } catch (error) {
        console.error("Error fetching NCR data:", error);
        return "ERROR";
    }
}


// Notify Department Manager Function
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
}

// EventListener code for submit button
document.getElementById('submit-engineering-btn').addEventListener('click', function() {
    createEngineeringForm();
});

//Eventlisteners for "Does the drawing require updating" to show or not show fields (defaults to no)
document.getElementById('require-updating-yes').addEventListener('change', function(){
    document.getElementById('revision-info').style.display = "";
});

document.getElementById('require-updating-no').addEventListener('change', function(){
    document.getElementById('revision-info').style.display = "none";
});

// Input validation and error handling for required fields
function handleInputValidation() {
    // Add input validation for specific required fields (review-by-engineer and disposition)
    const fieldsToValidate = ['review-by-engineer', 'disposition'];
    fieldsToValidate.forEach(field => {
        const input = document.querySelector(`[name="${field}"]`) || document.getElementById(field);
        if (input) {
            input.addEventListener('input', function() {
                if (this.value.trim() || (this.checked && field === 'review-by-engineer')) {
                    this.classList.remove('invalid-field');
                } else {
                    this.classList.add('invalid-field');
                }
            });
        }
    });
}

// Call the handleInputValidation function for specific required fields
handleInputValidation();
