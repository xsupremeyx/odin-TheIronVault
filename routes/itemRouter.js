const { Router } = require("express");
const itemRouter = Router();

// import controllers
const itemController = require("../controllers/itemController");

// define routes

itemRouter.get("/", itemController.listItems);
// itemRouter.get("/new", );
itemRouter.get("/:id", itemController.getItemDetail);

module.exports = itemRouter;