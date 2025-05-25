const path = require('path');
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require("dotenv").config({});

const authRouter = require("./routes/authRoutes");
const userRouter = require('./routes/userRoutes');
const errorController = require("./controllers/errorController");

const app = express();

const port = process.env.PORT || 3000;

// Global Middlewares
app.use(cors({credentials: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "Public")));

// Routes
app.use("/auths/", authRouter);
app.use("/users/", userRouter);

app.all('/{*any}', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
})
// app.use("*", (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

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
