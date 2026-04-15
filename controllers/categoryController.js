const db = require("../db/queries");

async function listCategories(req, res, next){
    try{
        const categoriesArr = await db.getAllCategories();
        res.render("index", { title: "The Iron Vault", categories: categoriesArr });
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
        res.render("categoryDetail", { title: "The Iron vault", category: categoryData.category, items: categoryData.items });
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
        res.redirect("/");
    }
    catch(err){
        next(err);
    }
}


module.exports = {
    listCategories,
    getCategoryDetail,
    getNewCategoryForm,
    createCategory,
}