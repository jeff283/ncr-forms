// Once user completes a quality form, it will create a new ncr
// Gets current year
let qualFormID;
const submitBtn = document.getElementById('submit-quality-btn');
sessionStorage.setItem('currentNCRStage', "QUA")

// Function which creates quality form
async function createQualityForm() {
    // Collect data from form fields
    const qualityFormData = {
        qualFormID: await getQualityFormID(),
        qualFormProcessApplicable: getProcess(),
        qualItemDesc: document.getElementById('description-item')?.value?.trim() || '', 
        qualIssueDesc: document.getElementById('description-defect')?.value?.trim() || '',
        qualItemID: parseInt(document.getElementById('po-prod-no')?.value?.trim(), 10) || null, 
        qualImageFileName: null, 
        qualSalesOrderNo: parseInt(document.getElementById('sales-order-no')?.value?.trim(), 10) || null,
        qualQtyReceived: parseFloat(document.getElementById('quantity-received')?.value?.trim()) || null, 
        qualQtyDefective: parseFloat(document.getElementById('quantity-defective')?.value?.trim()) || null, 
        qualItemNonConforming: parseInt(document.querySelector('input[name="item-nonconforming"]:checked')?.value, 10) || 0, 
        qualRepID: parseInt(sessionStorage.getItem('empID'), 10) || null, 
        qualDate: document.getElementById('quality-rep-date')?.value?.trim() || ''
    };

    const requiredFields = [
        'supplier-name', 
        'po-prod-no', 
        'sales-order-no', 
        'quantity-received', 
        'quantity-defective', 
        'description-item', 
        'description-defect', 
        'item-nonconforming', 
        'quality-rep-name'
    ];

    let formIsValid = true;

    // Check for empty required fields and add invalid class
    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        console.log(`Checking field ${field}:`, input); 

        if (field === 'item-nonconforming') {
            const nonConformingValue = document.querySelector('input[name="item-nonconforming"]:checked');
            if (!nonConformingValue) {
                formIsValid = false;
                document.getElementById(field)?.classList.add('invalid-field');
                console.log(`${field} is invalid (no option selected)`);
            } else {
                document.getElementById(field)?.classList.remove('invalid-field');
                console.log(`${field} is valid`);
            }
        } else if (!input || !input.value?.trim()) {
            formIsValid = false;
            input?.classList.add('invalid-field');
            console.log(`${field} is invalid (empty or whitespace)`);
        } else {
            input?.classList.remove('invalid-field');
            console.log(`${field} is valid`);
        }
    });

    // Validate if Sales Order, Quantity Received, and Quantity Defective are valid numbers
    const salesOrderNo = parseFloat(qualityFormData.qualSalesOrderNo);
    const qtyReceived = parseFloat(qualityFormData.qualQtyReceived);
    const qtyDefective = parseFloat(qualityFormData.qualQtyDefective);

    if (isNaN(salesOrderNo) || isNaN(qtyReceived) || isNaN(qtyDefective)) {
        formIsValid = false;
        alert('Please enter valid numbers for Sales Order Number, Quantity Received, and Quantity Defective.');
        
        if (isNaN(salesOrderNo)) {
            document.getElementById('sales-order-no').classList.add('invalid-field');
        }
        if (isNaN(qtyReceived)) {
            document.getElementById('quantity-received').classList.add('invalid-field');
        }
        if (isNaN(qtyDefective)) {
            document.getElementById('quantity-defective').classList.add('invalid-field');
        }
    }

    if (qtyReceived < qtyDefective) {
        formIsValid = false;
        alert('Quantity Received cannot be less than Quantity Defective.');
        document.getElementById('quantity-received').classList.add('invalid-field');
        document.getElementById('quantity-defective').classList.add('invalid-field');
    }

    console.log('Form valid status:', formIsValid);

    if (!formIsValid) {
        alert('Please fill out all required fields correctly.');
        return;
    }

    try {
        const response = await fetch('/api/qualityForms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(qualityFormData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        qualFormID = await getQualityFormID() - 1; 
        await createNCR();

    } catch (error) {
        console.error('Error creating quality form:', error);
        alert('Failed to create quality form. Please try again');
    }
}


// Function which generates quality form ID
async function getQualityFormID(){
    try{
        const response = await fetch('api/qualityForms');

        if(!response.ok){
            throw new Error('Network response was not ok.');
        }

        const data = await response.json();
        return data.length + 1;
    }
    catch(error){
        console.error('Error regarding quality form ID generation', error);
        throw error;
    }
}

// Function which handles supplier/ production process
function getProcess(){
    if(document.getElementById('recInsp').checked){
        return "SUP";
    } else return "WIP";
}

// Function to create new NCR in "ncr_form.json"
// Function is called after quality form is created
async function createNCR(){
    const ncrFormNo = currentYear + await getNCRCode();
    const ncrFormID = await getNCRFormID();
    
    // Stage changed bc quality form should already be created once this is called
    sessionStorage.setItem("currentNCRStage", "ENG"); 

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

// EventListener code for submit button
document.getElementById("supplier-name").addEventListener("input", function() {
    if (this.value && this.value !== "") {
        this.classList.remove("error");
    }
});

document.getElementById("po-prod-no").addEventListener("input", function() {
    if (this.value && this.value !== "") {
        this.classList.remove("error");
    }
});

document.getElementById("sales-order-no").addEventListener("input", function() {
    if (!isNaN(this.value) && this.value.trim() !== "") {
        this.classList.remove("error");
    }
});

document.getElementById("quantity-received").addEventListener("input", function() {
    if (this.value && !isNaN(this.value)) {
        this.classList.remove("error");
    }
});

document.getElementById("quantity-defective").addEventListener("input", function() {
    if (this.value && !isNaN(this.value)) {
        this.classList.remove("error");
    }
});

document.getElementById("description-item").addEventListener("input", function() {
    if (this.value && this.value.trim() !== "") {
        this.classList.remove("error");
    }
});

document.getElementById("description-defect").addEventListener("input", function() {
    if (this.value && this.value.trim() !== "") {
        this.classList.remove("error");
    }
});

// Event listener for radio buttons to remove error when selected
document.querySelectorAll('input[name="item-nonconforming"]').forEach(radio => {
    radio.addEventListener("change", function() {
        const formGroup = this.closest('.form-group');
        if (document.querySelector('input[name="item-nonconforming"]:checked')) {
            formGroup.classList.remove("error");
        }
    });
});

document.querySelectorAll('input[name="process-applicable"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        // Check if any checkbox is checked
        const checkboxGroup = document.querySelectorAll('input[name="process-applicable"]:checked');
        const processApplicableGroup = document.getElementById('process-applicable');  
        
        if (checkboxGroup.length > 0) {
            processApplicableGroup.classList.remove('error'); 
        } else {
            processApplicableGroup.classList.add('error');
        }
    });
});

// EventListener code for submit button
document.addEventListener('DOMContentLoaded', function() {
    // EventListener for submit button
    document.getElementById("ncr-form").addEventListener("submit", function(event) {
        event.preventDefault();

        removeErrorClasses();

        let hasError = false;

        // Validate Supplier
        const supplierName = document.getElementById("supplier-name");
        if (!supplierName.value || supplierName.value === "") {
            supplierName.classList.add("error");
            hasError = true;
        }

        // Validate Product
        const poProdNo = document.getElementById("po-prod-no");
        if (!poProdNo.value || poProdNo.value === "") {
            poProdNo.classList.add("error");
            hasError = true;
        }

        // Validate Sales Order Number
        const salesOrderNo = document.getElementById("sales-order-no");
        if (isNaN(salesOrderNo.value) || salesOrderNo.value.trim() === "") {
            salesOrderNo.classList.add("error");
            hasError = true;
        }

        // Validate Quantity Received
        const quantityReceived = document.getElementById("quantity-received");
        if (!quantityReceived.value || isNaN(quantityReceived.value)) {
            quantityReceived.classList.add("error");
            hasError = true;
        }

        // Validate Quantity Defective
        const quantityDefective = document.getElementById("quantity-defective");
        if (!quantityDefective.value || isNaN(quantityDefective.value)) {
            quantityDefective.classList.add("error");
            hasError = true;
        }

        // Validate Description of Item
        const descriptionItem = document.getElementById("description-item");
        if (!descriptionItem.value || descriptionItem.value.trim() === "") {
            descriptionItem.classList.add("error");
            hasError = true;
        }

        // Validate Description of Defect
        const descriptionDefect = document.getElementById("description-defect");
        if (!descriptionDefect.value || descriptionDefect.value.trim() === "") {
            descriptionDefect.classList.add("error");
            hasError = true;
        }

        // Validate Item Marked Nonconforming (Radio Button)
        const itemNonconforming = document.querySelector('input[name="item-nonconforming"]:checked');
        if (!itemNonconforming) {
            const radioButtons = document.querySelectorAll('input[name="item-nonconforming"]');
            radioButtons.forEach(button => {
                button.closest('.form-group').classList.add("error");
            });
            hasError = true;
        }

        // Validate Checkbox Group for Process Applicable
        const checkboxGroup = document.querySelectorAll('input[name="process-applicable"]:checked');
        const processApplicableGroup = document.getElementById('process-applicable');
        if (checkboxGroup.length === 0) {
            processApplicableGroup.classList.add("error");
            hasError = true;
        } else {
            processApplicableGroup.classList.remove("error");
        }

        // If there are any validation errors, prevent form submission
        if (hasError) {
            document.getElementById("errorModalBody").innerText = "Please fill in all required fields correctly.";
            new bootstrap.Modal(document.getElementById('errorModal')).show();
        } else {
            // If no errors, proceed with form submission
            createQualityForm();
        }
    });
});


// Function to remove error classes 
function removeErrorClasses() {
    const errorElements = document.querySelectorAll(".error");
    errorElements.forEach(element => {
        element.classList.remove("error");
    });
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
}
