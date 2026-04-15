const { Router } = require("express");
const indexRouter = Router();

// import controllers
const categoryController = require("../controllers/categoryController");

// define routes

indexRouter.get("/", categoryController.listCategories);

module.exports = indexRouter;