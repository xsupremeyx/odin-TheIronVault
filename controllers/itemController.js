const db = require("../db/queries");

// helper functions
function normalizeCategories(input) {
    return [input].flat().filter(Boolean).map(value => String(value));
}

async function listItems(req, res, next){
    try{
        const search = req.query.search || "";
        const rarity = req.query.rarity || "";
        const itemsArr = await db.getAllItems(search, rarity);
        res.render("items", { title: "Vault Inventory", items: itemsArr, search, rarity });
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
        res.render("itemDetail", { title: "The Iron Vault", item: itemData, errors: [] });
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
        const selectedCategories = normalizeCategories(req.body.categories);
        if (!errors.isEmpty()) {
            return res.status(400).render("itemForm", {
                title: "The Iron Vault",
                errors: errors.array(),
                values: {
                    ...req.body,
                    categories: selectedCategories
                },
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
        const categories = normalizeCategories(req.body.categories)
            .map(id => parseInt(id, 10))
            .filter(Number.isInteger);

        for (let categoryId of categories) {
            await db.addItemCategory(itemId, categoryId);
        }
        res.redirect(`/items`);
    }
    catch(err){
        next(err);
    }
}

async function getEditItemForm(req, res, next){
    try{
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            const err = new Error("Bad Request: Invalid Item ID");
            err.status = 400;
            return next(err);
        }

        const [itemData, categories, itemCategoryIds] = await Promise.all([
            db.getItemById(id),
            db.getAllCategories(),
            db.getItemCategoryIds(id),
        ]);

        if (!itemData) {
            const err = new Error("Item Not Found");
            err.status = 404;
            return next(err);
        }

        res.render("itemForm", {
            title: "The Iron Vault",
            errors: [],
            values: {
                id,
                name: itemData.name || "",
                description: itemData.description || "",
                price: itemData.price,
                quantity: itemData.quantity,
                rarity: itemData.rarity || "",
                categories: itemCategoryIds.map(String)
            },
            categories
        });
    }
    catch(err){
        next(err);
    }
}

async function updateItem(req, res, next){
    try{
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            const err = new Error("Bad Request: Invalid Item ID");
            err.status = 400;
            return next(err);
        }

        const [itemData, categoriesList] = await Promise.all([
            db.getItemById(id),
            db.getAllCategories(),
        ]);

        if (!itemData) {
            const err = new Error("Item Not Found");
            err.status = 404;
            return next(err);
        }

        const selectedCategories = normalizeCategories(req.body.categories);

        if (req.body.admin_password !== process.env.ADMIN_PASSWORD) {
            return res.status(403).render("itemForm", {
                title: "The Iron Vault",
                errors: [{ msg: "Invalid admin password" }],
                values: {
                    ...req.body,
                    id,
                    categories: selectedCategories
                },
                categories: categoriesList
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("itemForm", {
                title: "The Iron Vault",
                errors: errors.array(),
                values: {
                    ...req.body,
                    id,
                    categories: selectedCategories
                },
                categories: categoriesList
            });
        }

        const { name, description, price, quantity, rarity } = req.body;
        const categoryIds = selectedCategories.map(value => parseInt(value, 10)).filter(Number.isInteger);

        await db.updateItem(id, name, description, price, quantity, rarity);
        await db.updateItemCategories(id, categoryIds);

        res.redirect(`/items/${id}`);
    }
    catch(err){
        next(err);
    }
}

async function deleteItem(req, res, next){
    try{
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            const err = new Error("Bad Request: Invalid Item ID");
            err.status = 400;
            return next(err);
        }

        const itemData = await db.getItemById(id);

        if (!itemData) {
            const err = new Error("Item Not Found");
            err.status = 404;
            return next(err);
        }

        if (req.body.admin_password !== process.env.ADMIN_PASSWORD) {
            return res.status(403).render("itemDetail", {
                title: "The Iron Vault",
                item: itemData,
                errors: [{ msg: "Invalid admin password" }]
            });
        }

        await db.deleteItem(id);
        res.redirect("/items");
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
    getEditItemForm,
    updateItem,
    deleteItem,
}