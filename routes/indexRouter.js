const { Router } = require("express");
const indexRouter = Router();

// define routes

indexRouter.get("/", (req, res) => {
    res.render("landing", { title: "The Iron Vault" });
});

module.exports = indexRouter;