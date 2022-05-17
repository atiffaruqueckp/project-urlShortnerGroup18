const UrlModel = require("../Model/UrlModel");
const validUrl = require("valid-url");
const shortid = require("shortid");
const redis = require("redis");
const { promisify } = require("util");

// //Connect to redis
const redisClient = redis.createClient(
    16368,                                                   //port no
    "redis-16368.c15.us-east-1-2.ec2.cloud.redislabs.com",   //link
    { no_ready_check: true }
);
redisClient.auth("Y52LH5DG1XbiVCkNC2G65MvOFswvQCRQ", function (err) {  //password
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const isValid = (value) => {
    if (typeof value === "undefined" || value === null) return false

    if (typeof value === "string" && value.trim().length === 0) false

    else {

        return true
    }
}

//const isValidlongUrl = function (longUrl) {
//    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-)[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-)[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S)?$/.test(longUrl)
//}

const shortenUrl = async (req, res) => {
    try {
        const baseUrl = "http://localhost:3000";

        if (Object.entries(req.body).length == 0) {
            return res.status(400).send({ status: false, Message: "please provide data." });
        }

        const { longUrl } = req.body;


        if (!validUrl.isUri(baseUrl)) {
            return res.status(400).send({ status: false, Message: "invalid Base Url" });
        }

        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, msg: " longUrl is required." })
        }


        const urlCode = shortid.generate().toLowerCase();

        if (!validUrl.isUri(longUrl)) {
            return res.status(400).send({ status: false, Message: "Invalid Long Url" });
        }

        let isUrlExist = await UrlModel.findOne({ longUrl });
        if (isUrlExist) {
            return res.status(201).send({ status: true, Message: "Success", url: isUrlExist });
        }

        const shortUrl = baseUrl + "/" + urlCode;
        shortUrl.toLowerCase();
        const urlData = {
            longUrl,
            shortUrl,
            urlCode,
        };

        let newUrl = await UrlModel.create(urlData);
        return res.status(201).send({ status: true, Message: "success", url: newUrl });

    } catch (error) {
        res.status(500).send({ status: false, Err: error.message });
    }
};

// Using of redis caching.............................................................................

const getUrl = async (req, res) => {
    try {
        const urlCode = req.params.urlCode;

        if (Object.keys(urlCode) == 0) {
            return res.status(400).send({ status: false, message: "Please Provide a valid urlCode in path params" })
        }

        const cahcedUrl = await GET_ASYNC(`${urlCode}`)
        if (cahcedUrl) {
            let urlData = JSON.parse(cahcedUrl)

            return res.status(302).redirect(urlData.longUrl)
        } else {
            const profile = await UrlModel.findOne({ urlCode: urlCode });
            if (profile) {

                await SET_ASYNC(`${urlCode}`, JSON.stringify(profile))
                res.status(302).redirect(profile.longUrl);
            }
        }

    } catch (error) {
        res.status(500).send({ status: false, Message: error.message });
    }
};
module.exports.shortenUrl = shortenUrl;
module.exports.getUrl = getUrl;
