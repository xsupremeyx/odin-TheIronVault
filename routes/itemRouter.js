const { Router } = require("express");
const itemRouter = Router();
const { body } = require("express-validator");

// validate
const validateItem = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("quantity").isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),
    body("rarity")
        .isIn(["Common", "Uncommon", "Rare", "Epic", "Legendary"])
        .withMessage("Invalid rarity"),
    body("categories")
    .custom(value => {
        const arr = [value].flat().filter(Boolean);
        if (arr.length === 0) {
            throw new Error("Select at least one category");
        }
        return true;
    }),
];

// import controllers
const itemController = require("../controllers/itemController");

// define routes

itemRouter.get("/", itemController.listItems);
itemRouter.get("/new", itemController.getNewItemForm);
itemRouter.post("/", validateItem, itemController.createItem);

itemRouter.get("/:id/edit", itemController.getEditItemForm);
itemRouter.post("/:id/edit", validateItem, itemController.updateItem);

itemRouter.post("/:id/delete", itemController.deleteItem);

itemRouter.get("/:id", itemController.getItemDetail);

module.exports = itemRouter;