const { Router } = require("express");
const indexRouter = Router();

// import controllers
const categoryController = require("../controllers/categoryController");

// define routes

indexRouter.get("/", (req, res) => {
    res.render("landing", { title: "The Iron Vault" });
});

module.exports = indexRouter;