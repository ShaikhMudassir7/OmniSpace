const mongoose = require("mongoose");

const adminSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    mobile: { type: Number, required: true },
    email: { type: String, required: true },
    pass: { type: String, required: true },
    role: { type: String, required: true },
    branch: { type: String, required: true },
});

module.exports = mongoose.model("admins", adminSchema);