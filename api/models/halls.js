const mongoose = require("mongoose");

const hallsSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    branchName: { type: String, required: true },
    hallname: { type: String, required: true },
    rent: { type: String, required: true },
    security: { type: String, required: true },
    scharge: { type: String, required: true },
    GSTamount: { type: String, required: true },
});

module.exports = mongoose.model("halls", hallsSchema);