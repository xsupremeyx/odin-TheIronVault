const db = require("../db/queries");

async function listCategories(req, res, next){
    try{
        const categoriesArr = await db.getAllCategories();
        res.render("index", { title: "TheIronVault", categories: categoriesArr });
    }
    catch(err){
        next(err);
    }
}

async function getCategoryDetail(req, res, next){
    try{
        const categoryId = req.params.id;
        // null case
        const categoryData = await db.getCategoryById(categoryId);
        if(!categoryData){
            const err = new Error("Category Not Found");
            err.status = 404;
            throw err;
        }
        res.render("categoryDetail", { title: categoryData.category.name, category: categoryData.category, items: categoryData.items });
    }
    catch(err){
        next(err);
    }
}

module.exports = {
    listCategories,
    getCategoryDetail,
}