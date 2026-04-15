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

module.exports = {
    listCategories,
    getCategoryDetail,
}