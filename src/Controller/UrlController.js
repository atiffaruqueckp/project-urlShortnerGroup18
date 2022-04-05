const UrlModel = require("../Model/UrlModel");
const validUrl = require("valid-url");
const shortid = require("shortid");




const shortenUrl = async (req, res) => {
    try {
        const baseUrl = "http://localhost:3000";

        if (Object.entries(req.body).length == 0) {
            return res.status(400).send({ status: false, Message: "Invalid Request Params" });
        }

        const { longUrl } = req.body;

        if (!validUrl.isUri(baseUrl)) {
            return res.status(400).send({ status: false, Message: "invalid Base Url" });
        }

        const urlCode = shortid.generate().toLowerCase();

        if (!validUrl.isUri(longUrl)) {
            return res.status(400).send({ status: false, Message: "Invalid Long Url" });
        }

        let isUrlExist = await UrlModel.findOne({ longUrl });
        if (isUrlExist) {
            return res.status(200).send({ status: true, Message: "Success", url: isUrlExist });
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


//redirectToOriginalUrl....................................................................

const getUrl = async (req, res) => {
try {
    const urlCodes = req.params.urlCode.trim();
    const isUrlExist = await UrlModel.findOne({ urlCode: urlCodes });

    if (isUrlExist) {
        if (urlCodes !== isUrlExist.urlCode) {
        return res.status(404).send({ status: false, Message: "No Url Found, Please Check Url Code",});
        }
        return res.status(302).redirect(isUrlExist.longUrl);
    }

} catch (error) {
    res.status(500).send({ status: false, Message: error.message });
}
};
module.exports.shortenUrl = shortenUrl;
module.exports.getUrl = getUrl;