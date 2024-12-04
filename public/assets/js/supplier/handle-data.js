document.addEventListener('DOMContentLoaded', function() {
    fetchSuppliers();
});

// Function to fetch suppliers from the server
function fetchSuppliers() {
    fetch('/api/suppliers')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateSupplierTable(data);
        })
        .catch(error => console.error('Error fetching suppliers:', error));
}

function initializeTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Function to populate the supplier table
function populateSupplierTable(data) {
    const tableBody = document.getElementById('supplier-list');
    tableBody.innerHTML = ""; // Clear existing rows

    data.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.supName}</td>
            <td>${supplier.supContactName}</td>
            <td>${supplier.supContactEmail}</td>
            <td>${supplier.supContactPhone}</td>
            <td class="text-center action-buttons-td">
                <button class="action-btn" onclick="viewSupplier('${supplier.supID}')"
                    data-bs-toggle="tooltip" title="View Supplier"> <i class="bi bi-eye"></i>
                </button>
                <button class="action-btn" onclick="editSupplier('${supplier.supID}')"
                      data-bs-toggle="tooltip" title="Edit Supplier"> <i class="bi bi-pencil"></i>
                </button>
                <button class="action-btn" onclick="deleteSupplier('${supplier.supID}', '${supplier.supName}')"
                     data-bs-toggle="tooltip" title="Delete Supplier"> <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
        initializeTooltips();
    });
}

// Function to view selected supplier
function viewSupplier(supID) {
    fetch(`/api/suppliers/${supID}`)
        .then(response => response.json())
        .then(supplier => {
            document.getElementById('viewSupplierID').innerText = supplier.supID;
            document.getElementById('viewSupplierName').innerText = supplier.supName;
            document.getElementById('viewContactName').innerText = supplier.supContactName;
            document.getElementById('viewContactEmail').innerText = supplier.supContactEmail;
            document.getElementById('viewContactPhone').innerText = supplier.supContactPhone;
            document.getElementById('viewAddress').innerText = supplier.supAddress;
            document.getElementById('viewCity').innerText = supplier.supCity;
            document.getElementById('viewCountry').innerText = supplier.supCountry;

            const viewModal = new bootstrap.Modal(document.getElementById('viewModal'));
            viewModal.show();
        })
        .catch(error => console.error('Error fetching supplier:', error));
}

// Function to edit selected supplier
function editSupplier(supID) {
    fetch(`/api/suppliers/${supID}`)
        .then(response => response.json())
        .then(supplier => {
            document.getElementById('editSupID').value = supplier.supID;
            document.getElementById('editSupplierName').value = supplier.supName;
            document.getElementById('editContactName').value = supplier.supContactName;
            document.getElementById('editContactEmail').value = supplier.supContactEmail;
            document.getElementById('editContactPhone').value = supplier.supContactPhone;
            document.getElementById('editAddress').value = supplier.supAddress;
            document.getElementById('editCity').value = supplier.supCity;
            document.getElementById('editCountry').value = supplier.supCountry;

            const editModal = new bootstrap.Modal(document.getElementById('editModal'));
            editModal.show();
        })
        .catch(error => console.error('Error fetching supplier for editing:', error));

}

// Save changes event listener
document.getElementById('btnSaveChanges').onclick = function() {
    const supID = parseInt(document.getElementById('editSupID').value);
    const updatedSupplierData = {
        supID,
        supName: document.getElementById('editSupplierName').value,
        supContactName: document.getElementById('editContactName').value,
        supContactEmail: document.getElementById('editContactEmail').value,
        supContactPhone: document.getElementById('editContactPhone').value,
        supAddress: document.getElementById('editAddress').value,
        supCity: document.getElementById('editCity').value,
        supCountry: document.getElementById('editCountry').value,
    };

    fetch(`/api/suppliers/${supID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSupplierData),
    })
    .then(response => {
        if (response.ok) {
            fetchSuppliers(); // Refresh the supplier list
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            editModal.hide();
        } else {
            console.error('Failed to update supplier');
        }
    })
    .catch(error => console.error('Error updating supplier:', error));
}

// Function to handle deleting selected supplier
function deleteSupplier(supID, supName) {
    document.getElementById('deleteModalBody').innerText = `Are you sure you want to delete the record: ${supName}?`;

    document.getElementById('btnDeleteYes').onclick = function() {
        fetch(`/api/suppliers/${supID}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                fetchSuppliers(); // Refresh the supplier list
                const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
                modal.hide();
            } else {
                console.error('Failed to delete supplier');
            }
        })
        .catch(error => console.error('Error deleting supplier:', error));
    };

    document.getElementById('btnDeleteNo').onclick = function() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
    };

    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}

