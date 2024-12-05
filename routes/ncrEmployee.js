const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Path to the JSON file
const filename = path.join(
  __dirname,
  "../public/assets/data/ncr_employee.json"
);

// Read JSON file utility function
const readJsonFile = (file) => {
  const data = fs.readFileSync(file, "utf8");
  return JSON.parse(data);
};

// GET all NCR employees
router.get("/", (req, res) => {
  try {
    const data = readJsonFile(filename);
    res.json(data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to read JSON file" });
  }
});

// GET an NCR employee by ncrEmpID
router.get("/:ncrEmpID", (req, res) => {
  const value = Number(req.params.ncrEmpID); // Convert to number

  if (isNaN(value)) {
    return res
      .status(400)
      .json({
        status: "error",
        message: "NCR Employee ID not provided or invalid",
      });
  }

  try {
    const existingData = readJsonFile(filename);
    const ncrEmployee = existingData.find((item) => item.ncrEmpID === value);

    if (!ncrEmployee) {
      return res
        .status(404)
        .json({ status: "error", message: "NCR Employee not found" });
    }

    res.json(ncrEmployee);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "error", message: "Failed to read JSON file" });
  }
});

// Export the router
module.exports = router;
