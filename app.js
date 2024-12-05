const express = require("express");
const path = require("path");
const fs = require("fs");
const ncrFormsRoutes = require("./routes/ncrForms");
const productsRoutes = require("./routes/products");
const suppliersRoutes = require("./routes/suppliers");
const employeesRoutes = require("./routes/employees");
const positionsRoutes = require("./routes/positions");
const qualityFormsRoutes = require("./routes/qualityForms");
const engineerFormsRoutes = require("./routes/engineerForms");
const purchasingFormsRoutes = require("./routes/purchasingForms");
const statusRoutes = require("./routes/status");
const emailRoutes = require("./routes/emailRoutes");
const pdfRoutes = require("./routes/ncrPdfRoute.js");
const notificationsRoutes = require("./routes/notifications");
const ncrEmployeeRoutes = require("./routes/ncrEmployee");

const app = express();

// Set port
const PORT = process.env.PORT || 3000;

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// JSON middleware to parse JSON bodies
app.use(express.json());

app.use("/api/ncrForms", ncrFormsRoutes); // Route for NCR Forms
app.use("/api/products", productsRoutes); // Route for Products
app.use("/api/suppliers", suppliersRoutes); // Route for Suppliers
app.use("/api/employees", employeesRoutes); // Route for Employees
app.use("/api/positions", positionsRoutes); // Route for Positions
app.use("/api/qualityForms", qualityFormsRoutes); // Route for Quality Forms
app.use("/api/engineerForms", engineerFormsRoutes); // Route for Engineer Forms
app.use("/api/purchasingForms", purchasingFormsRoutes); // Route for Purchasing Forms
app.use("/api/status", statusRoutes); // Route for Stanpm tus
app.use("/api/email", emailRoutes);
app.use("/api/ncrPdfRoute", pdfRoutes);
app.use("/api/notifications", notificationsRoutes);

app.use("/api/ncrEmployee", ncrEmployeeRoutes);

// Serve the HTML page for NCR Forms
// app.get('/ncrForms', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public/views/index.html'));
// });

// Dynamic route to render other HTML pages
app.get("*", (req, res) => {
  const requestedPath = req.path === "/" ? "/login" : req.path;
  const sanitizedPath = requestedPath.replace(".html", "");
  const filePath = path.join(
    __dirname,
    "public",
    "views",
    `${sanitizedPath}.html`
  );

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send("404 Not Found");
    }
    res.sendFile(filePath);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
