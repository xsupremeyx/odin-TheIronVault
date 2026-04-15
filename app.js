// express imports
const express = require("express");
const app = express();
const path = require("node:path");
require("dotenv").config();

// ejs and static files setup
app.set("views", path.join(__dirname,"views"));
app.set("view engine", "ejs");
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

// middleware for form data parsing
app.use(express.urlencoded({ extended: true }));

// import routes
const indexRouter = require("./routes/indexRouter");
const categoryRouter = require("./routes/categoryRouter");
// const itemRouter = require("./routes/itemRouter");

// use routes
app.use("/", indexRouter);
app.use("/categories", categoryRouter);
// app.use("/items", itemRouter);

// 404 handler
app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
})

// global error handler
app.use((error, req, res, next) => {
    console.error(error);
    res.status(error.status || 500).send(error.message || "Internal Server Error");
})

const PORT = process.env.PORT || 3000
app.listen(PORT, (err) => {
    if(err){
        console.error("Error starting server:", err);
        return;
    }
    console.log(`Server is running on port ${PORT}`);
})