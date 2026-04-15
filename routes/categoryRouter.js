const { Router } = require("express");
const categoryRouter = Router();

// import controllers
const categoryController = require("../controllers/categoryController");

// define routes

// categoryRouter.get("/new", )
categoryRouter.get("/:id", categoryController.getCategoryDetail);

module.exports = categoryRouter;