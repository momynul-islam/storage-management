const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config({});

const authRouter = require("./routes/authRoutes");
const errorController = require("./controllers/errorController");

const app = express();

const port = process.env.PORT || 3000;

// Global Middlewares
app.use(cors());
app.options("*", cors());

// Routes
app.use("/auths/", authRouter);

app.use("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorController);

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("Connected to the database.");
    app.listen(port, () => {
      console.log(`Store-management server listening at port ${port}...`);
    });
  })
  .catch((err) => {
    console.log("Error connecting to the database", err);
  });
