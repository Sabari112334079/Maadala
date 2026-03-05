const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/ponmaaduDB")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

// Import routes
const assetRoutes = require("./Routes/Routes");

// Attach base path
app.use("/", assetRoutes);

app.get("/", (req, res) => {
  res.json({ message: "PonMaadu Server Running 🚀" });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});