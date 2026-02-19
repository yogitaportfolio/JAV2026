const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db/db");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: 1, message: "Welcome to express" });
});

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(helmet());
const adminusersRouter = require("./routes/adminusers");
const proceduresRouter = require("./routes/procedures");
const testsRouter = require("./routes/tests");
const unitsRouter = require("./routes/units");
const patientsRouter = require("./routes/patients");
const reportsRouter = require("./routes/reports");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/adminusers", adminusersRouter);
app.use("/procedures", proceduresRouter);
app.use("/tests", testsRouter);
app.use("/units", unitsRouter);
app.use("/patients", patientsRouter);
app.use("/reports", reportsRouter);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
