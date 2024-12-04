// sample data for quality inspector
document.getElementById('sample-data-btn-quality').addEventListener('click', function () {
    document.getElementById('supplier-name').value = 1;
    populateProductDropDownLists(window.products, document.getElementById('supplier-name').value);
    document.querySelector('input[name="process-applicable"][value="supplier"]').checked = true;
    document.getElementById('po-prod-no').value = 1;
    document.getElementById('sales-order-no').value = "SO54321";
    document.getElementById('quantity-received').value = "100";
    document.getElementById('quantity-defective').value = "5";
    document.getElementById('description-item').value = "1 gallon container of paint coating";
    document.getElementById('description-defect').value = "Paint container has rust on lid and edges";
    document.querySelector('input[name="item-nonconforming"][value="1"]').checked = true;
});

// sample data for engineering
document.getElementById('sample-data-btn-engineering').addEventListener('click', function () {
    document.querySelector('input[name="review-by-engineer"][value="Repair"]').checked = true;
    document.querySelector('input[name="require-notification"][value="1"]').checked = true;
    document.getElementById('disposition').value = "The identified defect in the component is determined to be repairable without impacting the product's functionality. SAP # ";
    document.querySelector('input[name="require-updating"][value="1"]').checked = true;
    document.getElementById('original-rev-number').value = "REV001";
    document.getElementById('updated-rev-number').value = "REV002";
    document.getElementById('revision-date').value = "2024-12-01";

});

// sample data for purchasing
document.getElementById('sample-data-btn-purchasing').addEventListener('click', function () {
    document.querySelector('input[name=""][value="Return to Supplier for either rework or replacement"]').checked = true;
    document.querySelector('input[name="car-raised"][value="1"]').checked = true;
    document.querySelector('input[name="follow-up-required"][value="0"]').checked = true;
    document.getElementById('car-number').value = "CAR123";
    document.getElementById('purchasing-date').value = "2024-12-01";
});