const express = require('express');
const router = express.Router();
//const bodyParser = require('body-parser')
const UrlController = require("../Controller/UrlController")


router.get("/test-me", function (req , res) {
    res.send("My first ever api!")
})

router.post("/url/shorten", UrlController.shortenUrl);

router.get("/:urlCode",UrlController.getUrl)

module.exports = router;