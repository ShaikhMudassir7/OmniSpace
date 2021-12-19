const mongoose = require("mongoose");

const vendorSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    vendorname: { type: String, required: true },
    type: { type: String, required: true },
    cperson: { type: String, required: true },
    vadd: { type: String, required: true },
    phone: { type: String, required: true },
    GST: { type: String, required: true },
    website: { type: String, required: true },
    notes: { type: String, required: true },
});

module.exports = mongoose.model("vendors", vendorSchema);