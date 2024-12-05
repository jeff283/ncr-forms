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
      updateMetrics(data.items);
      renderBarChart(data.items); // Render chart with the fetched data
      renderSupplierChart(data.items);
      renderStagesChart(data.items);
      renderProductChart(data.items);
      renderIssueDayofWeekChart(data.items);
      renderDepartmentChart(data.items);
    })
    .catch((error) => console.error("Error fetching NCR forms:", error));
}

async function fetchNCRStatus() {
  try {
    const response = await fetch("/api/status");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data; // Return the data here
  } catch (error) {
    console.error("Error fetching NCR statuses:", error);
    throw error; // Rethrow the error if you want to handle it further up
  }
}

// Updates metrics on the header
function updateMetrics(data) {
  const total = data.length;
  const active = data.filter((ncr) => ncr.ncrStatusID == 1).length;
  const inactive = data.filter((ncr) => ncr.ncrStatusID == 2).length;

  document.getElementById("metricTotal").innerText = total;
  document.getElementById("metricActive").innerText = active;
  document.getElementById("metricInactive").innerText = inactive;
}

//** Pre-Processing Functions **
function groupByIssueDayofWeek(data) {
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

    const supplierName = supplierData.supName || "Unknown"; // Get the supplier name or default to 'Unknown'

    // Count NCRs per supplier
    supplierCounts[supplierName] = (supplierCounts[supplierName] || 0) + 1;
  }

  return supplierCounts;
}
// Supplier chart
async function renderSupplierChart(data) {
  const ctx = document.getElementById("supplierChart").getContext("2d");

  // Group NCRs by supplier name using groupBySupplier function
  const supplierCounts = await groupBySupplier(data); // Await the asynchronous grouping function

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
          position: "top",
        },
      },
    },
  });
}

// CHART:  NCR by Status

// Pre-process function
function groupByNcrStage(data) {
  // Count the ncrStage from the data
  const stageGroups = data.reduce((acc, ncr) => {
    acc[ncr.ncrStage] = (acc[ncr.ncrStage] || 0) + 1;
    return acc;
  }, {});

  return stageGroups;
}

//Render function

function renderStagesChart(data) {
  const ctx = document.getElementById("statusChart").getContext("2d");

  // Get the grouped data by ncr stage
  const stageGroups = groupByNcrStage(data);
  const labels = Object.keys(stageGroups);
  const values = Object.values(stageGroups);

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "NCR Stage Distribution",
          data: values,
          backgroundColor: [
            "#173451",
            "rgba(75, 192, 192, 0.6)",
            "#FF6384",
            "#36A2EB",
          ],
          borderColor: [
            "rgba(23, 52, 81, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        title: {
          display: true,
          text: "NCR Stage Distribution",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const value = context.parsed;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

// CHART:  NCR BY product

//Pre-Processing Functions
function groupByProduct(data) {
  const productCounts = {};

  data.forEach((ncr) => {
    const product = ncr.prodID;
    productCounts[product] = (productCounts[product] || 0) + 1;
  });

  return productCounts;
}

//Render function

async function renderProductChart(data) {
  const ctx = document.getElementById("productChart").getContext("2d");

  // Group NCRs by product using groupByProduct function
  const productCounts = groupByProduct(data);
  const labels = Object.keys(productCounts);
  const values = Object.values(productCounts);

  //   Get product names from the API by their IDs
  const productResponse = await fetch("/api/products");
  const productData = await productResponse.json();

  //Get only product names that have their IDs in the productCounts object
  const productNames = productData.filter(
    (product) => productCounts[product.prodID]
  );

  // Render the product names on the chart
  labels.forEach((label, index) => {
    labels[index] = productNames[index].prodName;
  });

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "NCR's per Product",
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
            text: "Product Name",
          },
          ticks: {
            autoSkip: false, // Display all product names on the x-axis
          },
        },
        y: {
          beginAtZero: true,
          max: Math.max(...values) + 1, // Set max one point higher to make it more visible
          suggestedMax: Math.max(...values) + 1, // Ensure the axis extends
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
          position: "top",
        },
      },
    },
  });
}

// CHART:  NCR by Issue Date (day of the week)

// Pre-process function
function groupByIssueDayofWeek(data) {
  const dayOfWeekCounts = {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0,
  };

  data.forEach((ncr) => {
    const issueDate = new Date(ncr.ncrIssueDate);
    const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
      issueDate.getDay()
    ];
    dayOfWeekCounts[dayOfWeek]++;
  });

  return dayOfWeekCounts;
}

// Render function
function renderIssueDayofWeekChart(data) {
  const ctx = document.getElementById("dailyIssueDateChart").getContext("2d");

  // Get the grouped data by day of week
  const dayOfWeekCounts = groupByIssueDayofWeek(data);
  const labels = Object.keys(dayOfWeekCounts);
  const values = Object.values(dayOfWeekCounts);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "NCR's per Day of Week",
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
            text: "Day of Week",
          },
        },
        y: {
          beginAtZero: true,
          max: Math.max(...values) + 1,
          suggestedMax: Math.max(...values) + 1,
          title: {
            display: true,
            text: "Number of NCR",
          },
          ticks: {
            stepSize: 1,
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

// CHART:  NCR by Department

//Pre-Processing Functions

async function groupByDepartment(data) {
  const ncrEmployeeData = await (await fetch("/api/ncrEmployee")).json();
  const employeeData = await (await fetch("/api/employees")).json();
  const employeeDepartments = await (await fetch("/api/positions")).json();

  // Create sets for quick lookup
  const validEmpIDs = new Set(employeeData.map((emp) => emp.empID));

  // Create Department Mapping
  const departmentMapping = Object.fromEntries(
    employeeData.map((emp) => [
      emp.empID,
      employeeDepartments.find((dep) => dep.posID === emp.posID).posDescription,
    ])
  );

  // Group NCRs by Department
  const departmentCounts = ncrEmployeeData
    .filter((ncrEmp) => validEmpIDs.has(ncrEmp.empID))
    .reduce((counts, ncrEmp) => {
      const department = departmentMapping[ncrEmp.empID];
      counts[department] = (counts[department] || 0) + 1;
      return counts;
    }, {});

  return departmentCounts;
}

//Render function
async function renderDepartmentChart(data) {
  const ctx = document.getElementById("departmentChart").getContext("2d");

  // Group NCRs by department using groupByDepartment function
  const departmentCounts = await groupByDepartment(data);
  const labels = Object.keys(departmentCounts);
  const values = Object.values(departmentCounts);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "NCR's per Department",
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
            text: "Department",
          },
          ticks: {
            autoSkip: false, // Display all department names on the x-axis
          },
        },
        y: {
          beginAtZero: true,
          max: Math.max(...values) + 1, // Set max one point higher to make it more visible
          suggestedMax: Math.max(...values) + 1, // Ensure the axis extends
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
          position: "top",
        },
      },
    },
  });
}

document.addEventListener("DOMContentLoaded", function () {
  fetchNcrForms();
});
