const supplierSelect = document.getElementById("supplier-name");
const productSelect = document.getElementById("po-prod-no");
const statusSelect = document.getElementById("status");

// Fetches all the Data from the API
function fetchNcrForms() {
  fetch("/api/ncrForms")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      updateMetrics(data);
      renderBarChart(data); // Render chart with the fetched data
      renderSupplierChart(data);
      renderStatusChart(data);
    })
    .catch((error) => console.error("Error fetching NCR forms:", error));
}

// Updates metrics on the header
function updateMetrics(data) {
  const total = data.length;
  const active = data.filter((ncr) => ncr.ncrStatusID == "OPEN").length;
  const inactive = data.filter((ncr) => ncr.ncrStatusID == "CLSD").length;

  document.getElementById("metricTotal").innerText = total;
  document.getElementById("metricActive").innerText = active;
  document.getElementById("metricInactive").innerText = inactive;
}

//Pre-Processing Functions

function groupByIssueDate(data) {
  const dateCounts = {};

  data.forEach((ncr) => {
    const issueDate = ncr.ncrIssueDate.substring(0, 10); // Format: YYYY-MM-DD
    dateCounts[issueDate] = (dateCounts[issueDate] || 0) + 1;
  });

  return dateCounts;
}

// Groups NCR's by year-month
function groupByYearMonth(data) {
  const dateCounts = {};

  data.forEach((ncr) => {
    // Extract "YYYY-MM" from "YYYY-MM-DD" format
    const issueYearMonth = ncr.ncrIssueDate.substring(0, 7); // e.g., "2024-11"
    dateCounts[issueYearMonth] = (dateCounts[issueYearMonth] || 0) + 1;
  });

  return dateCounts;
}

// Renders the year-month chart
function renderBarChart(data) {
  const ctx = document.getElementById("issueDateChart").getContext("2d");

  // Get the grouped data by year-month
  const dateCounts = groupByYearMonth(data);
  const labels = Object.keys(dateCounts);
  const values = Object.values(dateCounts);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "NCR's per Year-Month",
          data: values,
          backgroundColor: "#173451",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Year-Month",
          },
        },
        y: {
          beginAtZero: true, // Ensure Y-axis starts at 0
          title: {
            display: true,
            text: "Number of NCR Forms",
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
          position: "top",
        },
      },
    },
  });
}

// Groups NCR's by supplier for the supplier chart
function groupBySupplier(data) {
  const supplierCounts = {};

  // Iterate over each NCR record to count by supplier name
  data.forEach((ncr) => {
    const supplier = ncr.ncrSupplierName || "Unknown"; // Default to 'Unknown' if supplier name is missing
    supplierCounts[supplier] = (supplierCounts[supplier] || 0) + 1;
  });
  console.log("Supplier Counts");
  return supplierCounts; // Returns an object like { "Supplier Name 1": count, "Supplier Name 2": count, ... }
}

// Renders the supplier chart
function renderSupplierChart(data) {
  const ctx = document.getElementById("supplierChart").getContext("2d");

  // Group NCRs by supplier name using groupBySupplier function
  const supplierCounts = groupBySupplier(data);
  const labels = Object.keys(supplierCounts); // Supplier names
  const values = Object.values(supplierCounts); // NCR counts per supplier

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "NCR's per Supplier",
          data: values,
          backgroundColor: "#173451",
          borderColor: "rgba(255, 171, 0, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Supplier Name",
          },
          ticks: {
            autoSkip: false, // Display all supplier names on the x-axis
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Number of NCR Forms",
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
          position: "top",
        },
      },
    },
  });
}

// CHART:  NCR by Status

// Pre-process function
function groupByStatus(data) {
  const statusCounts = {};
  data.forEach((ncr) => {
    const status = ncr.ncrStatusID;
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  console.log("Group by Status");
  console.log(statusCounts);
  return statusCounts;
}

//Render function
function renderStatusChart(data) {
  const ctx = document.getElementById("statusChart").getContext("2d");

  // Get the grouped data by status
  const statusCounts = groupByStatus(data);
  const labels = Object.keys(statusCounts);
  const values = Object.values(statusCounts);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "NCR's per Status",
          data: values,
          backgroundColor: "#173451",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Status",
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
          position: "top",
        },
      },
    },
  });
}

fetchNcrForms();
