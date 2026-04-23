const express = require("express");
const router = express.Router();
//const { getAllLOR, createLOR } = require("../controllers/lorController");
const lorController = require("../controllers/lorController");

router.post("/", lorController.createLOR);
router.get("/requests", lorController.getAllLOR); // 👈 THIS MUST EXIST

module.exports = router;