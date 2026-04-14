const { Router } = require("express");
const indexRouter = Router();

// import controllers
// const indexController = require("../controllers/indexController");

// define routes

indexRouter.get("/", (req, res) => {
    res.render("index");
})

module.exports = indexRouter;