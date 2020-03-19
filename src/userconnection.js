const mongoose = require('mongoose')

const userconnectionSchema = mongoose.Schema({

    _id: mongoose.Types.ObjectId,
    cid: Number,
    token: String
})

module.exports = mongoose.model('Userconnection', userconnectionSchema)