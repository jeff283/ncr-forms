document.addEventListener("DOMContentLoaded", function() {
    const headerDateSelector = document.getElementById("date-range-selector");
    const customRangeContainer = document.getElementById("custom-range-container");
    const filterBtn = document.getElementById('filter-btn');
    const resetBtn = document.getElementById('reset-filter-btn');
    const supplierSelect = document.getElementById('supplier-name');
    const stageSelect = document.getElementById('status');
    const issueDatePicker = document.getElementById('filterIssueDate');

    // Read URL parameters on page load
    const urlParams = new URLSearchParams(window.location.search);
    const savedSupplier = urlParams.get('supplier');
    const savedStage = urlParams.get('stage');
    const savedIssueDate = urlParams.get('issueDate');

    // Set the filter selections based on the URL parameters
    if (savedSupplier) {
        supplierSelect.value = savedSupplier;
    }
    if (savedStage) {
        stageSelect.value = savedStage;
    }
    if (savedIssueDate) {
        issueDatePicker.value = savedIssueDate;
    }

    // Function to populate the supplier dropdown
    function populateSupplierDropDownLists(suppliers) {
        if (!Array.isArray(suppliers)) {
            console.error('Suppliers data is not in an array format:', suppliers);
            return;
        }

        // Clear any existing options before adding new ones
        supplierSelect.innerHTML = '<option value="-1">Select Supplier</option>'; // Default option

        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.supID;
            option.textContent = supplier.supName;
            supplierSelect.appendChild(option);
        });
    }

    // Fetch and populate supplier dropdown
    fetch('../api/suppliers')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load suppliers');
            }
            return response.json();
        })
        .then(data => {
            populateSupplierDropDownLists(data);
        })
        .catch(error => {
            console.error('Error fetching supplier data:', error);
        });

    // Function to update the URL with current filter parameters
    function updateUrlParams() {
        const params = new URLSearchParams();

        const supplier = supplierSelect.value;
        const stage = stageSelect.value;
        const issueDate = issueDatePicker.value;

        if (supplier && supplier !== "-1") params.set('supplier', supplier);
        if (stage) params.set('stage', stage);
        if (issueDate) params.set('issueDate', issueDate);

        // Update the browser's URL without reloading the page
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    }

    // Event listener for filter button
    filterBtn.addEventListener('click', function() {
        const selectedSupplierValue = supplierSelect.value;
        const selectedStageValue = stageSelect.value;
        const selectedIssueDateValue = issueDatePicker.value;

        // Update URL with selected filters
        updateUrlParams();

        if(selectedSupplierValue<0 && selectedStageValue == "" && selectedIssueDateValue == ""){
            //document.getElementById("pagination-controls").style.display = "none";
            return;
        }
        else{
            document.getElementById("pagination-controls").style.display = "none";
            document.getElementById("page-number").style.display = "none";
        }

        fetch(`/api/ncrForms`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(async ncrData => {
                let filteredData = ncrData.items; 

                if (selectedSupplierValue > 0) {
                    // Fetch products and filter by selected supplier
                    await fetch(`/api/products`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok.');
                            }
                            return response.json();
                        })
                        .then(productsData => {
                            // Filter products by supplier
                            const filteredProdData = productsData.filter(product => Number(product.supID) === Number(selectedSupplierValue));
                            const filteredProductIDs = filteredProdData.map(product => product.prodID);
                            filteredData = filteredData.filter(ncr => filteredProductIDs.includes(ncr.prodID));
                        })
                        .catch(error => console.error('Error fetching products:', error));
                }

                if (selectedStageValue) {
                    filteredData = filteredData.filter(ncr => ncr.ncrStage === selectedStageValue);
                }

                if (selectedIssueDateValue) {
                    filteredData = filteredData.filter(ncr => ncr.ncrIssueDate === selectedIssueDateValue);
                }

                populateRecentNcrTable(filteredData);
                tooltip();
            })
            .catch(error => console.error('Error fetching NCR forms:', error));
    });

    // Event listener for reset button
    resetBtn.addEventListener('click', function() {
        // Reset select values
        supplierSelect.value = "-1";
        stageSelect.value = "";
        issueDatePicker.value = "";

        // Remove all URL parameters
        updateUrlParams();

        location.reload();
    });

    // Handle date range selection
    headerDateSelector.addEventListener("change", function() {
        let days = 0;

        if (headerDateSelector.value == "7-days") {
            customRangeContainer.style.display = "none";
            days = 7;
        } else if (headerDateSelector.value == "30-days") {
            customRangeContainer.style.display = "none";
            days = 30;
        } else {
            customRangeContainer.style.display = "block";

            const btnFilterDateRange = document.getElementById("submit-custom-date");

            btnFilterDateRange.onclick = function() {
                const customStartDateInput = document.getElementById("start-date").value;
                const customEndDateInput = document.getElementById("end-date").value;

                if (!customStartDateInput || !customEndDateInput) {
                    alert('Please fill out both start and end dates.');
                    return;
                }

                const customStartDate = new Date(customStartDateInput);
                const customEndDate = new Date(customEndDateInput);

                if (customStartDate > customEndDate) {
                    alert('Start date cannot be after the end date.');
                    return;
                }

                fetch('/api/ncrForms')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok.');
                        }
                        return response.json();
                    })
                    .then(data => {
                        const filteredData = data.items.filter(ncr => {
                            const issueDate = new Date(ncr.ncrIssueDate);
                            return issueDate >= customStartDate && issueDate <= customEndDate;
                        });

                        populateRecentNcrTable(filteredData);
                        tooltip();
                    })
                    .catch(error => console.error('Error fetching NCR forms:', error));
            };
        }

        const currentDate = new Date();
        const rangeStartDate = new Date();
        rangeStartDate.setDate(currentDate.getDate() - days);

        fetch('/api/ncrForms')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const filteredData = data.items.filter(ncr => {
                    const issueDate = new Date(ncr.ncrIssueDate);
                    return issueDate >= rangeStartDate && issueDate <= currentDate;
                });
                populateRecentNcrTable(filteredData);
                tooltip();
            })
            .catch(error => console.log('Error fetching NCR forms: ', error));
    });
});
