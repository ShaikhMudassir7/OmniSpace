const mongoose = require("mongoose");

const branchSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    bname: { type: String, required: true },
    badd: { type: String, required: true },
    bank: { type: String, required: true },
});

module.exports = mongoose.model("branches", branchSchema);