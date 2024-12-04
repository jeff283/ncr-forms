document.addEventListener('DOMContentLoaded', function () {
    fetchProducts();
    populateSupplierDropdown();
});

// Function to fetch products from the server
function fetchProducts() {
    fetch('/api/products')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            populateProductTable(data);
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Function to populate the supplier dropdown in the edit modal
function populateSupplierDropdown() {
    fetch('/api/suppliers')
        .then(response => response.json())
        .then(suppliers => {
            const supplierDropdown = document.getElementById('editSupplier');
            supplierDropdown.innerHTML = ""; // Clear existing options

            suppliers.forEach(supplier => {
                const option = document.createElement('option');
                option.value = supplier.supID;
                option.textContent = supplier.supName;
                supplierDropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching suppliers:', error));
}

function getSupplierName(supID) {
    return fetch(`/api/suppliers/${supID}`)
        .then(response => response.json())
        .then(supplier => supplier.supName)
        .catch(error => {
            console.error(`Error fetching supplier with ID ${supID}:`, error);
            return 'Unknown Supplier';
        });
}

// Function to populate the product table
function populateProductTable(data) {
    const tableBody = document.getElementById('product-list');
    tableBody.innerHTML = ""; // Clear existing rows

    data.forEach(product => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${product.prodID}</td>
            <td>${product.prodName}</td>
            <td>${product.prodCategory}</td>
            <td id="supplier-${product.prodID}">Loading...</td>
            <td class="text-center action-buttons-td">
                <button class="action-btn" onclick="viewProduct('${product.prodID}')"
                   data-bs-toggle="tooltip" title="View Product"> <i class="bi bi-eye"></i>
                </button>
                <button class="action-btn" onclick="editProduct('${product.prodID}')"
                    data-bs-toggle="tooltip" title="Edit Product"> <i class="bi bi-pencil"></i>
                </button>
                <button class="action-btn" onclick="deleteProduct('${product.prodID}', '${product.prodName}')"
                   data-bs-toggle="tooltip" title="Delete Product"> <i class="bi bi-trash"></i>
                </button>
            </td>
            
        `;
        
        tableBody.appendChild(row);

        getSupplierName(product.supID).then(supplierName => {
            document.getElementById(`supplier-${product.prodID}`).innerText = supplierName;
        });
    });

    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
}

function viewProduct(productID) {
    fetch(`/api/products/${productID}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById('viewProductID').innerText = product.prodID;
            document.getElementById('viewProductName').innerText = product.prodName;
            document.getElementById('viewProductCategory').innerText = product.prodCategory;

            // Fetch supplier name using supID
            return fetch(`/api/suppliers/${product.supID}`);
        })
        .then(response => response.json())
        .then(supplier => {
            document.getElementById('viewProductSupplier').innerText = supplier.supName;

            const viewModal = new bootstrap.Modal(document.getElementById('viewModal'));
            viewModal.show();
        })
        .catch(error => console.error('Error fetching product or supplier:', error));
}

// Function to edit selected product
function editProduct(productID) {
    fetch(`/api/products/${productID}`)
        .then(response => response.json())
        .then(product => {
            document.getElementById('editProductID').value = product.prodID;
            document.getElementById('editProductName').value = product.prodName;
            document.getElementById('editProductCategory').value = product.prodCategory;

            const supplierDropdown = document.getElementById('editSupplier');
            supplierDropdown.value = product.supID; // Set the selected supplier based on product supID

            const editModal = new bootstrap.Modal(document.getElementById('editModal'));
            editModal.show();
        })
        .catch(error => console.error('Error fetching product for editing:', error));
}

// Save changes event listener
document.getElementById('btnSaveChanges').onclick = function () {
    const prodID = parseInt(document.getElementById('editProductID').value);
    const updatedProductData = {
        prodID,
        prodName: document.getElementById('editProductName').value,
        prodCategory: document.getElementById('editProductCategory').value,
        supID: document.getElementById('editSupplier').value,
    };

    fetch(`/api/products/${prodID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProductData),
    })
        .then(response => {
            if (response.ok) {
                fetchProducts(); // Refresh the product list
                const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
                editModal.hide();
            } else {
                console.error('Failed to update product');
            }
        })
        .catch(error => console.error('Error updating product:', error));
}

// Function to handle deleting selected product
function deleteProduct(productID, productName) {
    document.getElementById('deleteModalBody').innerText = `Are you sure you want to delete the product: ${productName}?`;

    document.getElementById('btnDeleteYes').onclick = function () {
        fetch(`/api/products/${productID}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    fetchProducts(); // Refresh the product list
                    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
                    modal.hide();
                } else {
                    console.error('Failed to delete product');
                }
            })
            .catch(error => console.error('Error deleting product:', error));
    };

    document.getElementById('btnDeleteNo').onclick = function () {
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
    };

    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}
