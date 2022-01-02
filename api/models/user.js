const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true },
    usermob: { type: Number, required: true },
    useremail: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    branch: { type: String, required: true },
});

module.exports = mongoose.model("users", userSchema);