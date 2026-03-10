require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected ✅"))
  .catch(err => console.log("MongoDB Error:", err));

// Import routes
const assetRoutes = require("./Routes/Routes");

// Attach base path
app.use("/", assetRoutes);

app.get("/", (req, res) => {
  res.json({ message: "PonMaadu Server Running 🚀" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);});