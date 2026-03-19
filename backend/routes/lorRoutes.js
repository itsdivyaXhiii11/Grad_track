const express = require("express");
const router = express.Router();

const lorController = require("../controllers/lorController");

console.log(lorController);  

router.post("/lor-request", lorController.createLOR);

module.exports = router;