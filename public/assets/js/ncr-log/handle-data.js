const pageSize = 10;
let currentPage = 1;

function resetProductSelect() {
    const productSelect = document.getElementById('editProduct');
    while (productSelect.options.length) {
        productSelect.remove(0);
    }

    const defaultOption = document.createElement('option');
    defaultOption.value = "-1";  
    defaultOption.textContent = "Select a Product";  
    defaultOption.selected = true; 

    productSelect.appendChild(defaultOption);
}

// bootstrap tooltip 
function initializeTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

const urlParams = new URLSearchParams(window.location.search);
const savedSupplier = urlParams.get('supplier');
const savedStage = urlParams.get('stage');
const savedIssueDate = urlParams.get('issueDate');

function fetchNcrForms(page = 1, pagelimitSize = pageSize) {
    const paginationParams = `page=${page}&limit=${pagelimitSize}`;
    let url = `/api/ncrForms?${paginationParams}`;

    // Append filters to the URL if they exist
    if (savedSupplier) url += `&supplier=${savedSupplier}`;
    if (savedStage) url += `&stage=${savedStage}`;
    if (savedIssueDate) url += `&issueDate=${savedIssueDate}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === "success") {
                // Update page number
                document.getElementById('page-number').textContent = `Page ${data.currentPage}`;
                
                populateRecentNcrTable(data.items);

                renderPaginationControls(data); // Modified to handle URL params
            } else {
                console.error('Failed fetching data for pagination');
            }
        })
        .catch(error => console.error('Error fetching NCR forms:', error));
}

// Function to render pagination controls
function renderPaginationControls(data) {
    const paginationContainer = document.getElementById('pagination-controls');
    paginationContainer.innerHTML = ''; // Clear previous pagination buttons

    const currentPage = data.currentPage;
    const totalPages = data.totalPages;

    const maxButtons = 3; // Maximum number of page buttons to show at once
    const pagesToShow = Math.min(maxButtons, totalPages); // Make sure we don't exceed total pages
    
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - pagesToShow + 1);
    }

    // Create 'First' and 'Prev' buttons
    createNavigationButton(paginationContainer, 'First', 1, currentPage === 1);
    createNavigationButton(paginationContainer, 'Prev', currentPage - 1, currentPage === 1);

    // Create page number buttons
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.onclick = () => fetchNcrForms(i);
        pageButton.disabled = i === currentPage; // Disable the current page button
        paginationContainer.appendChild(pageButton);
    }

    // Show "..." button if there are more pages after the last displayed page
    if (endPage < totalPages) {
        const ellipsisButton = document.createElement('button');
        ellipsisButton.textContent = '...';
        ellipsisButton.onclick = () => showPageInput(currentPage, totalPages);
        paginationContainer.appendChild(ellipsisButton);
    }

    // Create 'Next' and 'Last' buttons
    createNavigationButton(paginationContainer, 'Next', currentPage + 1, currentPage === totalPages);
    createNavigationButton(paginationContainer, 'Last', totalPages, currentPage === totalPages);
}

// Function to create navigation buttons
function createNavigationButton(container, text, page, isDisabled) {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = () => fetchNcrForms(page);
    button.disabled = isDisabled;
    container.appendChild(button);
}

// Function to show page input 
function showPageInput(currentPage, totalPages) {
    const paginationContainer = document.getElementById('pagination-controls');

    // Input field
    const pageInput = document.createElement('input');
    pageInput.type = 'number';
    pageInput.value = currentPage;
    pageInput.min = 1;
    pageInput.max = totalPages;
    pageInput.classList.add('page-input');

    // Create the submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Go';
    submitButton.onclick = () => {
        const inputPage = parseInt(pageInput.value);
        if (inputPage >= 1 && inputPage <= totalPages) {
            fetchNcrForms(inputPage);
        } else {
            alert('Please enter a valid page number');
        }
    };

    // Clear pagination and show the input field
    paginationContainer.innerHTML = '';
    paginationContainer.appendChild(pageInput);
    paginationContainer.appendChild(submitButton);
    pageInput.style.display = 'inline-block'; // Show the input
}


function updateMetrics(data) {
    const total = data.length;
    const active = data.filter(ncr => ncr.ncrStatusID == "OPEN").length;
    const inactive = data.filter(ncr => ncr.ncrStatusID == "CLSD").length;

    document.getElementById('metricTotal').innerText = total;
    document.getElementById('metricActive').innerText = active;
    document.getElementById('metricInactive').innerText = inactive;
}

// Function to populate recent NCR table with data
async function populateRecentNcrTable(data) {
    const tableBody = document.getElementById('tbodyRecentNCR');
    tableBody.innerHTML = '';

    let openRecords = 0;

    for (let i = 0; i < data.length; i++) {
        let ncr = data[i];

        const row = document.createElement('tr'); 

        let ncrStatus;
        if (ncr.ncrStatusID === 1) {
            ncrStatus = "Open";
            openRecords++;
        } else continue;

        const productResponse = await fetch(`/api/products/${ncr.prodID}`);
        const productData = await productResponse.json();

        const supplierResponse = await fetch(`/api/suppliers/${productData.supID}`);
        const supplierData = await supplierResponse.json();

        const supplierName = supplierData.supName;

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

function viewNCR(ncrFormID) {
    sessionStorage.setItem("mode", "view");
    window.location.href = `non-conformance-report.html?ncrFormID=${ncrFormID}`;
}

function editNCR(ncrFormID) {
    sessionStorage.setItem("mode", "edit");
    window.location.href = `edit-ncr.html?ncrFormID=${ncrFormID}`;
    populateNCRInputs(ncrFormID);
}

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


function changePage(direction) {
    if (direction === 'next') {
        currentPage++;
    } else if (direction === 'prev') {
        currentPage--;
    } else if (direction === 'first') {
        currentPage = 1;
    } else if (direction === 'last') {
        currentPage = totalPages;
    }

    fetchNcrForms(currentPage);
}

fetchNcrForms(); 
