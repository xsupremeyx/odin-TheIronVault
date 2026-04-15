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
        const itemId = req.params.id;
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


module.exports = {
    listItems,
    getItemDetail,
}