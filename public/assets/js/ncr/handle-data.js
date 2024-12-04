// Bootstrap toggle for tooltips
function initializeTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Fetch from NCR Forms API
function fetchNcrForms(){
    fetch('/api/ncrForms')
        .then(response => {
            if(!response.ok){
                throw new Error('Network response was not ok.');
            }
            return response.json();
        })
        .then(data => {
            populateRecentNcrTable(data.items);
            updateMetrics(data.items);
            renderBarChart(data.items);
            renderSupplierChart(data.items);
        })
        .catch(error => console.error('Error fetching NCR forms:', error))
}

// Function to update metrics on page
function updateMetrics(data){
    // Parse through data to get metric values
    const total = data.length;
    const active = data.filter(ncr => ncr.ncrStatusID === 1).length;
    const inactive = data.filter(ncr => ncr.ncrStatusID === 2).length;

    // Set metrics
    document.getElementById('metricTotal').innerText = total;
    document.getElementById('metricActive').innerText = active;
    document.getElementById('metricInactive').innerText = inactive;
}

// Function to populate recent NCR table
async function populateRecentNcrTable(data){
    // Get tablebody element & clear innerHTML
    const tableBody = document.getElementById('tbodyRecentNCR');
    tableBody.innerHTML = '';

    data.sort((a,b) => new Date(b.ncrIssueDate) - new Date(a.ncrIssueDate));

    let openRecords = 0; 

    let userRole = sessionStorage.getItem('userRole');

    // Loop which iterates over all items in data array
    for(let i = 0; i < data.length; i ++){
        // If 5 open records are showing, then break out of loop
        if(openRecords === 5) break;

        let ncr = data[i];

        const row = document.createElement('tr'); // Create new row element to be used in the table

        //Only show necessary forms to user
        if(userRole === "Quality" && ncr.ncrStage != "QUA"){
            continue;
        }
        if(userRole === "Engineering" && ncr.ncrStage != "ENG"){
            continue;
        }
        if(userRole === "Purchasing" && ncr.ncrStage != "PUR"){
            continue;
        }  

        let ncrStatus;
        // If status is open, incriment openRecords
        if(ncr.ncrStatusID === 1){
            ncrStatus = "Open";
            openRecords++;
        } else continue;

        // Fetch supplier name 
        const productResponse = await fetch(`/api/products/${ncr.prodID}`);
        const productData = await productResponse.json();

        const supplierResponse = await fetch(`/api/suppliers/${productData.supID}`);
        const supplierData = await supplierResponse.json();

        const supplierName = supplierData.supName;

        // Generating table row
        row.innerHTML = `
            <td>${ncr.ncrFormNo}</td>
            <td>${supplierName}</td>
            <td>${ncr.ncrIssueDate.substring(0, 10)}</td>
            <td>${ncr.ncrStage}</td>
            <td class="action-buttons-td">
                <button class="action-btn" onclick="viewNCR('${ncr.ncrFormID}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="View NCR">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="action-btn" onclick="editNCR('${ncr.ncrFormID}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Edit NCR">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="action-btn" onclick="archiveNCR('${ncr.ncrFormID}', '${ncr.ncrFormNo}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Archive NCR">
                    <i class="bi bi-archive"></i>
                </button>
                <button class="action-btn" onclick="printNCR('${ncr.ncrFormID}', '${encodeURIComponent(JSON.stringify(ncr))}')" data-bs-toggle="tooltip" title="Print PDF">
                    <i class="bi bi-filetype-pdf"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
        initializeTooltips();
    }
}

// DOMContentLoaded EventListener
document.addEventListener('DOMContentLoaded', function () {
    loadNotifications();
});

// Groups NCR records by issue date
function groupByIssueDate(data) {
    const dateCounts = {};

    data.forEach(ncr => {
        const issueDate = ncr.ncrIssueDate.substring(0, 10); // Format: YYYY-MM-DD
        dateCounts[issueDate] = (dateCounts[issueDate] || 0) + 1;
    });

    return dateCounts;
}

//Groups NCR records by YYYY-MM
function groupByYearMonth(data) {
    const dateCounts = {};

    data.forEach(ncr => {
        // Extract "YYYY-MM" from "YYYY-MM-DD" format
        const issueYearMonth = ncr.ncrIssueDate.substring(0, 7); // e.g., "2024-11"
        dateCounts[issueYearMonth] = (dateCounts[issueYearMonth] || 0) + 1;
    });

    return dateCounts;
}    
// NCR chart 
function renderBarChart(data) {
    const ctx = document.getElementById('issueDateChart').getContext('2d');

    // Get the grouped data by year-month
    const dateCounts = groupByYearMonth(data);
    const labels = Object.keys(dateCounts);
    const values = Object.values(dateCounts);

    // Number of labels to skip for better spacing when the range is wide
    const skipLabels = Math.max(Math.floor(labels.length / 20), 1); // Adjust the divisor (20) based on your preference

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.filter((label, index) => index % skipLabels === 0), // Skip labels to prevent overlap
            datasets: [{
                label: "NCR's per Year-Month",
                data: values.filter((_, index) => index % skipLabels === 0), // Only show corresponding data for visible labels
                backgroundColor: '#173451',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year-Month',
                    },
                    ticks: {
                        autoSkip: true, // Automatically skip labels if necessary
                        maxRotation: 45, // Rotate labels for better readability
                        minRotation: 45,
                    },
                },
                y: {
                    beginAtZero: true, // Ensure Y-axis starts at 0
                    title: {
                        display: true,
                        text: "Number of NCR",
                    },
                    ticks: {
                        stepSize: 1, // Count NCR forms in whole numbers (0, 1, 2, etc.)
                    },
                },
            },
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
            },
        },
    });
}

//Groups NCR's by supplier
async function groupBySupplier(data) {
    const supplierCounts = {};

    // Iterate over each NCR record to count by supplier name
    for (let ncr of data) {
        const prodID = ncr.prodID;
        
        // Fetch the product based on prodID
        const productResponse = await fetch(`/api/products/${prodID}`);
        const productData = await productResponse.json();

        const supID = productData.supID;

        // Fetch the supplier based on supID
        const supplierResponse = await fetch(`/api/suppliers/${supID}`);
        const supplierData = await supplierResponse.json();

        const supplierName = supplierData.supName || 'Unknown'; // Get the supplier name or default to 'Unknown'

        // Count NCRs per supplier
        supplierCounts[supplierName] = (supplierCounts[supplierName] || 0) + 1;
    }

    return supplierCounts; // Returns an object like { "Supplier Name 1": count, "Supplier Name 2": count, ... }
}
// Supplier chart
async function renderSupplierChart(data) {
    const ctx = document.getElementById('supplierChart').getContext('2d');

    // Group NCRs by supplier name using groupBySupplier function
    const supplierCounts = await groupBySupplier(data); // Await the asynchronous grouping function

    const labels = Object.keys(supplierCounts); // Supplier names
    const values = Object.values(supplierCounts); // NCR counts per supplier

    // Number of labels to skip for better spacing when there are too many
    const skipLabels = Math.max(Math.floor(labels.length / 20), 1); // Adjust the divisor (20) based on your preference

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.filter((label, index) => index % skipLabels === 0), // Skip labels to prevent overlap
            datasets: [{
                label: "NCR's per Supplier",
                data: values.filter((_, index) => index % skipLabels === 0), // Only show corresponding data for visible labels
                backgroundColor: '#173451',
                borderColor: 'rgba(255, 171, 0, 1)',
                borderWidth: 1,
            }],
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Supplier Name',
                    },
                    ticks: {
                        autoSkip: false, // Display all supplier names on the x-axis
                        maxRotation: 45, // Rotate labels to prevent overlap
                        minRotation: 45,
                    },
                    // To prevent label overlap in case of long names, adjust this option
                    grid: {
                        display: false, // Hide grid lines if they're interfering with label visibility
                    },
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Number of NCR",
                    },
                    ticks: {
                        stepSize: 1, // Use whole numbers for NCR count
                    },
                },
            },
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
            },
        },
    });
}

// Viewing NCR's
function viewNCR(ncrFormID){
    const mode = 'view';
    sessionStorage.setItem("mode", "view");
    window.location.href = `non-conformance-report.html?ncrFormID=${ncrFormID}`;
}

// Editing NCR's
function editNCR(ncrFormID){
    const mode = 'edit'
    window.location.href = `edit-ncr.html?ncrFormID=${ncrFormID}`;
    sessionStorage.setItem("mode", "edit");
    populateNCRInputs(ncrFormID);
}

// Printing NCR to PDF
function printNCR(ncrFormID) {
    const isConfirmed = confirm('Are you sure you want to generate and print the NCR report?');
    if (!isConfirmed) return;

    console.log(`Fetching NCR form with ID: ${ncrFormID}`);

    fetch(`/api/ncrForms/${ncrFormID}`)
        .then(response => {
            console.log('Received response for NCR form:', response);
            if (!response.ok) throw new Error('Failed to fetch NCR form');
            return response.json();
        })
        .then(ncrData => {
            console.log('NCR data received:', ncrData);
            if (!ncrData || typeof ncrData !== 'object') throw new Error('Invalid NCR data received');

            // Fetch related data
            const productFetch = fetch(`/api/products/${ncrData.prodID}`).then(res => res.json()); // Fetch product details
            const qualityFetch = fetch(`/api/qualityForms/${ncrData.qualFormID}`).then(res => res.json()); // Fetch quality form data
            const engineeringFetch = ncrData.engFormID ? fetch(`/api/engineerForms/${ncrData.engFormID}`).then(res => res.json()) : Promise.resolve(null); // Fetch engineering data if available
            const purchasingFetch = ncrData.purFormID ? fetch(`/api/purchasingForms/${ncrData.purFormID}`).then(res => res.json()) : Promise.resolve(null);  // Fetch purchasing data if available

            return Promise.all([ncrData, productFetch, qualityFetch, engineeringFetch, purchasingFetch]);
        })
        .then(([ncrData, productData, qualityData, engineeringData, purchasingData]) => {
            console.log('All data fetched:', { ncrData, productData, qualityData, engineeringData, purchasingData });

            // Use `supID` from `productData` to fetch supplier data
            return Promise.all([
                Promise.resolve(ncrData),
                Promise.resolve(productData),
                fetch(`/api/suppliers/${productData.supID}`).then(res => res.json()), // Fetch supplier data
                Promise.resolve(qualityData),
                Promise.resolve(engineeringData),
                Promise.resolve(purchasingData),
            ]);
        })
        .then(([ncrData, productData, supplierData, qualityData, engineeringData, purchasingData]) => {
            console.log('Supplier data fetched:', supplierData);
            
            const pdfData = {
                ncrData,
                productData,
                supplierData,
                qualityData,
                engineeringData,
                purchasingData,
            };

            console.log('Sending data to generate PDF:', pdfData);

            return fetch('/api/ncrPdfRoute/generate-ncr-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pdfData),
            });
        })
        .then(response => {
            console.log('Received response for PDF generation:', response);
            if (!response.ok) throw new Error('Failed to generate PDF');
            return response.blob();
        })
        .then(blob => {
            console.log('Received PDF blob');
            const url = window.URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = 'NCR_Report.pdf';
            downloadLink.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error generating the NCR report. Please try again.');
        });
}

// Archive NCR 
function archiveNCR(ncrFormID, ncrFormNo) {
    fetch(`/api/ncrForms/${ncrFormID}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch NCR form');
            return response.json();
        })
        .then(data => {
            const { engFormID, purFormID, ncrStage } = data;

            if (ncrStage === 'ARC') {
                alert('This NCR form is already archived.');
                return;
            }

            // Check for incomplete fields
            const incompleteFields = [];
            if (!engFormID) incompleteFields.push('Engineering Form');
            //if (!purFormID) incompleteFields.push('Purchasing Form');

            let confirmationMessage = `Are you sure you want to archive this NCR form?`;
            if (incompleteFields.length > 0) {
                confirmationMessage += `\nThe following form(s) are not completed: ${incompleteFields.join(', ')}.`;
            }

            // Ask for confirmation
            if (!confirm(confirmationMessage)) {
                return;
            }

            // Proceed to archive the form
            fetch(`/api/ncrForms/${ncrFormID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    ncrStage: 'ARC',
                    ncrStatusID: 2, 
                }),
            })
                .then(response => {
                    if (response.ok) {
                        alert('NCR form archived successfully!');
                        window.location.reload(); // Refresh the page
                    } else {
                        return response.json().then(error => {
                            throw new Error(error.message || 'Failed to archive NCR form');
                        });
                    }
                })
                .catch(error => {
                    console.error('Error archiving NCR form:', error);
                    alert(`Error: ${error.message}`);
                });
        })
        .catch(error => {
            console.error('Error fetching NCR form:', error);
            alert(`Error: ${error.message}`);
        });
}


//DOMContentLoaded Event Listener
document.addEventListener('DOMContentLoaded', function(){
    fetchNcrForms();

    const newNCRButton = document.getElementById('new-ncr-btn');

    newNCRButton.addEventListener('click', function() {
        window.location.href = 'non-conformance-report.html?';
    });

    // Default create mode
    sessionStorage.setItem("mode", "create");

    const loggedInUser = {
        name: sessionStorage.getItem('userName'),
        department: sessionStorage.getItem('userRole')
    }

    const ncrHeading = document.getElementById('ncr-heading');
    ncrHeading.textContent = `New NCR's for ${loggedInUser.department}`

    const empID = sessionStorage.getItem('empID');
    loadNotifications(empID); 
});

// Show the modal when the notification bell is clicked
document.getElementById('notificationBell').addEventListener('click', () => {
    const empID = sessionStorage.getItem('empID');
    loadNotifications(empID); // Fetch and load notifications
});


