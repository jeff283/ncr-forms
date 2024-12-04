let errorList = [];

const successModal = new bootstrap.Modal(document.getElementById('successModal'));
const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));

function validateInputs(){
    errorList = [];
    let isValid = true;
    
    const first = document.getElementById('empFirstName').value;
    const last = document.getElementById('empLastName').value;
    const email = document.getElementById('empEmail').value;
    const dateHire = document.getElementById('empDateHired').value;
    const salary = parseFloat(document.getElementById('empSalary').value.trim());
    const phone = document.getElementById('empPhone').value.trim();
    const address = document.getElementById('empAddress').value.trim();
    const username = document.getElementById('empUsername').value.trim();
    const password = document.getElementById('empPassword').value.trim();
    const position = parseInt(document.getElementById('position').value.trim());

    if (!first || !last || !email || !dateHire || !salary || !phone || !address || !username || !password || !position) {
        errorList.push("Please fill in all fields.");
        isValid = false;
    }

    if (isNaN(phone) || phone.length !== 10) {
        errorList.push("Phone number should be a 10-digit numeric value.");
        isValid = false;
    }
    if (isNaN(salary) || parseFloat(salary) <= 0) {
        errorList.push("Salary should be a valid number greater than 0.");
        isValid = false;
    }

    if(isValid){
        createEmployee();
        document.getElementById('successModalBody').innerText = 'Employee created successfully!';
        successModal.show();
        const successClick = document.getElementById('btnDismiss');
        successClick.addEventListener('click', e => {
            e.preventDefault();
            window.location.href = "employee.html";
        })
    }
    else{
        const errorMessages = errorList.join('\n');
        document.getElementById('errorModalBody').innerText = `Validation Errors:\n${errorMessages}`;
        errorModal.show();        
    }
}
// Function to create a new employee
async function createEmployee() {
    const employeeData = {
        empFirstName: document.getElementById('empFirstName').value.trim(),
        empLastName: document.getElementById('empLastName').value.trim(),
        empEmail: document.getElementById('empEmail').value.trim(),
        empDateHired: document.getElementById('empDateHired').value,
        empSalary: parseFloat(document.getElementById('empSalary').value.trim()),
        empPhone: document.getElementById('empPhone').value.trim(),
        empAddress: document.getElementById('empAddress').value.trim(),
        empActive: document.getElementById('empActive').checked ? 'ACTV' : 'INAC', 
        empUsername: document.getElementById('empUsername').value.trim(),
        empPassword: document.getElementById('empPassword').value.trim(),
        posID: parseInt(document.getElementById('position').value.trim()) 
    };

    try {
        const response = await fetch('/api/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // Clear the form or redirect as needed
        //document.getElementById('employee-form').reset();
    } catch (error) {
        console.error('Error creating employee:', error);
    }
}

// Add event listener to the form submission
document.getElementById('employee-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission
    validateInputs();
});
