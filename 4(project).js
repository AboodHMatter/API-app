// const express = require('express');
// const app = express();
// app.use(express.json());

// let controllers = require("./controllers/courses-controller.js");
// let router = require("./routers/courses-routers.js");

// app.use("/", router);

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:3000`);
// });
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require('mongoose');
const url = process.env.MONGO_URL;
const path = require("path");

app.use(cors());
app.use(express.json())

let router = require("./routers/courses-routers.js")
let userRouter = require("./routers/user-routers.js")

app.use('/uploads',express.static(path.join(__dirname, "uploads")));

app.use("/", router);
app.use("/", userRouter);


app.all(/(.*)/, (req, res, next) => {
  res.status(404).json({ status: "fail", data: { course: "Course not found" } }).end();
})

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    err.statusCode = 400;
    err.statusText = "fail";
    // Usually the message is 'User validation failed: ...'
    // To get just the validation message, you can access err.errors.<field>.message
    const msg = Object.values(err.errors).map(val => val.message).join(', ');
    err.message = msg;
  }
  res.status(err.statusCode || 500).json({ status: err.statusText || "error", data: null, message: err.message, Code: err.statusCode || 500 }).end();
})
mongoose.connect(url).then(() => {
  console.log("mongo server started");
  app.listen(process.env.port || 3000, () => {
    console.log("server is running on http://localhost:" + (process.env.port || 3000));
  });
}).catch((err) => {
  console.error("Mongoose connection error:", err);
});