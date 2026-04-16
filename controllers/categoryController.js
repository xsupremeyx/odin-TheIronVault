const db = require("../db/queries");

async function listCategories(req, res, next){
    try{
        const categoriesArr = await db.getAllCategories();
        res.render("categories", { title: "Guild Registry", categories: categoriesArr });
    }
    catch(err){
        next(err);
    }
}

async function getCategoryDetail(req, res, next){
    try{
        const categoryId = parseInt(req.params.id,10);
        if (isNaN(categoryId)) {
            const err = new Error("Bad Request: Invalid Category ID");
            err.status = 400;
            return next(err);
        }
        // null case
        const categoryData = await db.getCategoryById(categoryId);
        if(!categoryData){
            const err = new Error("Category Not Found");
            err.status = 404;
            throw err;
        }
        res.render("categoryDetail", { title: "Wares in this Guild", category: categoryData.category, items: categoryData.items, errors: [] });
    }
    catch(err){
        next(err);
    }
}


// post

async function getNewCategoryForm(req, res, next){
    try{
        res.render("categoryForm", {
            title: "The Iron Vault",
            errors: [],
            values: { name: "", description: "", image_url: "" }
        })
    }
    catch(err){
        next(err);
    }
}

const { validationResult } = require("express-validator");

async function createCategory(req,res,next){
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("categoryForm", {
                title: "The Iron Vault",
                errors: errors.array(),
                values: req.body
            });
        }
        const { name, description, image_url } = req.body;
        await db.createCategory(name, description, image_url);
        res.redirect("/categories");
    }
    catch(err){
        next(err);
    }
}

async function getEditCategoryForm(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            const err = new Error("Invalid Category ID");
            err.status = 400;
            return next(err);
        }

        const categoryData = await db.getCategoryById(id);

        if (!categoryData) {
            const err = new Error("Category Not Found");
            err.status = 404;
            return next(err);
        }

        res.render("categoryForm", {
            title: "The Iron Vault",
            errors: [],
            values:  { ...categoryData.category, id }
        });

    } catch (err) {
        next(err);
    }
}

async function updateCategory(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            const err = new Error("Invalid Category ID");
            err.status = 400;
            return next(err);
        }

        if (req.body.admin_password !== process.env.ADMIN_PASSWORD) {
            return res.status(403).render("categoryForm", {
                title: "The Iron Vault",
                errors: [{ msg: "Invalid admin password" }],
                values: { ...req.body, id }
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("categoryForm", {
                title: "The Iron Vault",
                errors: errors.array(),
                values: { ...req.body, id }
            });
        }

        const { name, description, image_url } = req.body;

        await db.updateCategory(id, name, description, image_url);

        res.redirect(`/categories/${id}`);
    } catch (err) {
        next(err);
    }
}

async function deleteCategory(req, res, next) {
    let categoryData;
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            const err = new Error("Invalid Category ID");
            err.status = 400;
            return next(err);
        }

        categoryData = await db.getCategoryById(id);

        if (!categoryData) {
            const err = new Error("Category Not Found");
            err.status = 404;
            return next(err);
        }

        if (req.body.admin_password !== process.env.ADMIN_PASSWORD) {
            return res.status(403).render("categoryDetail", {
                title: "The Iron Vault",
                category: categoryData.category,
                items: categoryData.items,
                errors: [{ msg: "Invalid admin password" }]
            });
        }

        await db.deleteCategory(id);

        res.redirect("/categories");
    } catch (err) {
        if (err.message && err.message.includes("linked items")) {
            return res.render("categoryDetail", {
                title: "The Iron Vault",
                category: categoryData.category,
                items: categoryData.items,
                errors: [{ msg: err.message }]
            });
        }
        next(err);
    }
}

module.exports = {
    listCategories,
    getCategoryDetail,
    getNewCategoryForm,
    createCategory,
    getEditCategoryForm,
    updateCategory,
    deleteCategory,
}