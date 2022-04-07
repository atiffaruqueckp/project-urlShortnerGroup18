const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;


const urlSchema = new mongoose.Schema({


    urlCode: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    longUrl: {
        type: String,
        required: true,
        unique: true     //valid url id
    },
    shortUrl: {
        type: String,
        unique: true,
        //required: true

    }

}, { timestamps: true });

module.exports = mongoose.model('url', urlSchema);






