const { Router } = require("express");
const { body } = require("express-validator");
const categoryRouter = Router();

// validate
const validateCategory = [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("image_url")
        .isIn([
            "/images/melee.jpg",
            "/images/magic.jpg",
            "/images/armor.jpg",
            "/images/consumables.jpg",
            "/images/ranged.jpg",
            "/images/misc.jpg"
        ])
        .withMessage("Invalid image selection"),
];

// import controllers
const categoryController = require("../controllers/categoryController");

// define routes

categoryRouter.get("/new", categoryController.getNewCategoryForm);
categoryRouter.post("/", validateCategory, categoryController.createCategory);

categoryRouter.get("/:id/edit", categoryController.getEditCategoryForm);
categoryRouter.post("/:id/edit", validateCategory, categoryController.updateCategory);

categoryRouter.post("/:id/delete", categoryController.deleteCategory);

categoryRouter.get("/:id", categoryController.getCategoryDetail);

module.exports = categoryRouter;