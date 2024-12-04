// Function to create or update purchasing form
async function createPurchasingForm(){
    const status = await checkNCRValidity();

    if(status === "VALID" || status === "UPDATE"){
        //Collect inputs
        const purchasingFormData = {
            purFormID: await getPurchasingFormID(status),
            purDescription: document.querySelector('input[name="preliminary-decision"]:checked').value,
            purCarRaised: document.querySelector('input[name="car-raised"]:checked').value,
            purCarNo: document.getElementById('car-number').value,
            purFollowUpReq: document.querySelector('input[name="follow-up-required"]:checked').value,
            purFollowUpType: document.getElementById('purchasing-followup').value,
            purFollowUpDate: document.getElementById('purchasing-followup-date').value,
            purInspectorID: sessionStorage.getItem('empID'),
            purNCRClosingDate: document.getElementById('purchasing-date').value
        }

    const requiredFields = [];
    let formIsValid = true;

    requiredFields.forEach(field => {

    });

    // If form is invalid, stop form submission\
    if(!formIsValid){
        alert('Please fill out all required fields correctly')
        return;
    }

    try{
        const response = await fetch(`/api/purchasingForms/${purchasingFormData.purFormID}`, {
            method: status === "UPDATE" ? 'PUT' : 'POST', // Use PUT if updating
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(purchasingFormData)
        });

        if(!response.ok){
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        alert(status === "UPDATE" ? 'Purchasing form updated successfully' : 'Engineering form created successfully');

        const ncrFormNo = document.getElementById('ncr-no').value.replace(/\D/g, ''); // Clean up NCR form no
        await notifyDepartmentManager(ncrFormNo, ""); 

    } catch(error){
        console.error('Error creating or updating purchasing form:', error);
        alert('Failed to create or update purchasing form. Please try again');
    }

    }else if (status === "ERROR") {
        alert('Unknown error, Please try again and if the issue persists check with administrator');
    } else if (status === "INCOMPLETE") {
        alert('Cannot create or update purchasing form. Form is incomplete meaning there is no other entries (quality rep/ engineering).\nCheck other entries and try again');
    } else if (status === "INVALID") {
        alert('Cannot create or update purchasing form. NCR number is not valid.');
    }
}

// Function which ghenerates the existing purchasing form ID
async function getPurchasingFormID(status) {
    if(status === "UPDATE"){
        // Return the existing form ID fromt he databse or from the user input if updating
        const ncrNo = document.getElementById('ncr-no').value.replace(/\D/g, '');
        try{
            const response = await fetch(`/api/purchasingForms/${ncrNo}`) // Fetch existing form based on NCR no

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

// Function to handle NCR validity and form status
async function checkNCRValidity(){
    let ncrNo = document.getElementById('ncr-no').value.replace(/\D/g, '');

    if(isNaN(ncrNo)){
        return "INVALID";
    }

    try{
        const response = await fetch('/api/ncrForms');
        const ncrData = await response.json();

        const ncrForm = ncrData.find(item => item.ncrFormNo === ncrNo);

        if (!ncrForm) {
            return "INVALID";
        }

        //Check if the quality form is missing
        if(ncrForm.qualFormID == null){
            return "INCOMPLETE"; // Returns incomplete if quality form is missing
        }

        //Check if the engineering form is missing
        if(ncrForm.engFormID == null){
            return "INCOMPLETE"; // Returns incomplete if the engineering form is missing
        }

        // Else return "VALID"
        return "VALID";
    }
    catch(error){
        console.error("Error fetching NCR data:", error);
        return "ERROR"
    }
}

//Notify departments
async function notifyDepartmentManager(ncrFormNo, department) {
    const recipient = "andrewdionne09@gmail.com"; 
    const subject = `NCR Complete: Form ${ncrFormNo}`;
    const message = `
NCR Form ${ncrFormNo} is now complete. It has now been archived.\nPlease review and make any neccessary changes in your department\nThank you,

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

document.getElementById('purchasing-form').addEventListener('submit', function(event){
    event.preventDefault();
    createEngineeringForm();
})

function handleInputValidation(){
    //FINISH FUNCTION
}

handleInputValidation();