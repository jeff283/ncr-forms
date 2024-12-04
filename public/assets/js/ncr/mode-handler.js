const userRole = sessionStorage.getItem("userRole");
const urlParams = new URLSearchParams(window.location.search);
const mode = sessionStorage.getItem("mode")

document.addEventListener('DOMContentLoaded', () => {
    handleUserAccess();
    reDisableInaccessibleInputs();
});

function handleUserAccess() {
    if (mode === 'view') {
        viewModeAccess();
    } 
    else{
        handleUserRole(userRole)
    }
}

function handleUserRole(userRole){
    switch(userRole){
        case "Administrator": adminAccess(); break;
        case "Quality": qualityAccess(); break;
        case "Engineering": engineeringAccess(); break;
        case "Purchasing": purchasingAccess(); break;
        default: noAccess();
    }

    navigateToUserForm();
}

function viewModeAccess(){
    disableAllInputs();  // Disables all input elements for view mode
}

function adminAccess(){
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.removeAttribute('readonly');
        input.removeAttribute('disabled');
    });
}

function qualityAccess(){
    disableAllInputs();  // Disable all inputs by default
    disableEngineeringForm();
    disablePurchasingForm();
    const qualityFields = document.querySelectorAll('#section-quality input, #section-quality select, #section-quality textarea');
    qualityFields.forEach(input => {
        input.removeAttribute('readonly');
        input.removeAttribute('disabled');
    });
}

function engineeringAccess(){
    disableAllInputs();  // Disable all inputs by default
    disablePurchasingForm();
    const engineeringFields = document.querySelectorAll('#section-engineering input, #section-engineering select, #section-engineering textarea');
    engineeringFields.forEach(input => {
        input.removeAttribute('readonly');
        input.removeAttribute('disabled');
    });

    document.getElementById('submit-quality-btn').style.display = "none";
}

function purchasingAccess(){
    disableAllInputs();

    const purchasingFields = document.querySelectorAll('#section-purchasing input, #section-purchasing select, #section-purchasing textarea');
    purchasingFields.forEach(input => {
        input.removeAttribute('readonly');
        input.removeAttribute('disabled');
    });

    document.getElementById('submit-quality-btn').style.display = "none";
    document.getElementById('submit-engineering-btn').style.display = "none"
}

function noAccess(){
    disableAllInputs();  // No access for unauthorized roles
}

function reDisableInaccessibleInputs() {
    document.getElementById("ncr-no").setAttribute('readonly', true);
    document.getElementById("ncr-no").setAttribute('disabled', true);
    
    document.getElementById("document-no").setAttribute('readonly', true);
    document.getElementById("document-no").setAttribute('disabled', true);
    
    document.getElementById("ncr-date").setAttribute('readonly', true);
    document.getElementById("ncr-date").setAttribute('disabled', true);
    
    document.getElementById("stage").setAttribute('readonly', true);
    document.getElementById("stage").setAttribute('disabled', true);
    
    document.getElementById("quality-rep-name").setAttribute('readonly', true);
    document.getElementById("quality-rep-name").setAttribute('disabled', true);
    
    document.getElementById("quality-rep-date").setAttribute('readonly', true);
    document.getElementById("quality-rep-date").setAttribute('disabled', true);
    
    document.getElementById("engineering").setAttribute('readonly', true);
    document.getElementById("engineering").setAttribute('disabled', true);
    
    document.getElementById("engineer-date").setAttribute('readonly', true);
    document.getElementById("engineer-date").setAttribute('disabled', true);
}


// Helper function to disable all inputs
function disableAllInputs(){
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.setAttribute('readonly', true);
        input.setAttribute('disabled', true);
    });
}

function disableEngineeringForm(){
    document.getElementById('engineering-fieldset').style.display = "none";
}

function disablePurchasingForm(){
    document.getElementById('purchasing-fieldset').style.display = "none";
}

// Function which closes forms based on the status of the current form (only in edit mode of course)
function navigateToUserForm(){
    if(mode === "edit"){

        const urlParams = new URLSearchParams(window.location.search);
        const ncrFormID = urlParams.get('ncrFormID');  

        fetch(`/api/ncrForms/${ncrFormID}`)
        .then(response => response.json())
        .then(async ncrForm => {
            if (ncrForm.qualFormID === null) {
                document.getElementById('section-quality').style.display = "block";
                document.getElementById('section-engineering').style.display = "none";
                document.getElementById('section-purchasing').style.display = "none";
            } else if (ncrForm.engFormID === null) {
                document.getElementById('section-quality').style.display = "none";
                document.getElementById('section-engineering').style.display = "block";
                document.getElementById('section-purchasing').style.display = "none";
            } else if (ncrForm.purFormID === null) {
                document.getElementById('section-quality').style.display = "none";
                document.getElementById('section-engineering').style.display = "none";
                document.getElementById('section-purchasing').style.display = "block";
            } else {
                console.log("All forms are closed or completed.");
                document.getElementById('section-quality').style.display = "none";
                document.getElementById('section-engineering').style.display = "none";
                document.getElementById('section-purchasing').style.display = "none";
            }
        })
        .catch(error => {
            console.error('Error fetching NCR form:', error);
        });
    }
    else return;
}
