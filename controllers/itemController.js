const db = require("../db/queries");

async function listItems(req, res, next){
    try{
        const search = req.query.search || "";
        const rarity = req.query.rarity || "";
        const itemsArr = await db.getAllItems(search, rarity);
        res.render("items", { title: "Items", items: itemsArr, search, rarity });
    }
    catch(err){
        next(err);
    }
}

async function getItemDetail(req,res,next){
    try{
        const itemId = parseInt(req.params.id,10);
        if (isNaN(itemId)) {
            const err = new Error("Bad Request: Invalid Item ID");
            err.status = 400;
            return next(err);
        }
        // null case
        const itemData = await db.getItemById(itemId);
        if(!itemData){
            const err = new Error("Item Not Found");
            err.status = 404;
            throw err;
        }
        res.render("itemDetail", { title: "The Iron Vault", item: itemData });
    }
    catch(err){
        next(err);
    }
}

async function getNewItemForm(req, res, next){
    try{
        const categories = await db.getAllCategories();
        res.render("itemForm", {
            title: "The Iron Vault",
            errors: [],
            values: {
                name: "",
                description: "",
                price: "",
                quantity: "",
                rarity: "",
                categories: []
            },
            categories
        })
    }
    catch(err){
        next(err);
    }
}

const { validationResult } = require("express-validator");
async function createItem(req, res, next){
    try{
        const categoriesList = await db.getAllCategories();
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("itemForm", {
                title: "The Iron Vault",
                errors: errors.array(),
                values: req.body,
                categories: categoriesList
            });
        }
        const { name, description, price, quantity, rarity } = req.body;
        const itemId = await db.createItem(
            name,
            description,
            price,
            quantity,
            rarity
        );
        const categories = [req.body.categories].flat().filter(Boolean);

        for (let categoryId of categories) {
            await db.addItemCategory(itemId, categoryId);
        }
        res.redirect(`/items`);
    }
    catch(err){
        next(err);
    }
}

module.exports = {
    listItems,
    getItemDetail,
    getNewItemForm,
    createItem,
}