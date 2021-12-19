const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: { type: String, required: true },
    cname: { type: String, required: true },
    cmob: { type: String, required: true },
    cmail: { type: String, required: true },
    cadd: { type: String, required: true },
    hall: { type: String, required: true },
    bdate: { type: String, required: true },
    pbook: { type: String, required: true },
    noofdays: { type: String, required: true },
    esd: { type: String, required: true },
    eed: { type: String, required: true },
    est: { type: String, required: true },
    eet: { type: String, required: true },
    rname: { type: String },
    rmob: { type: String },
    deco: { type: String, required: true },
    cat: { type: String, required: true },
    rent: { type: String, required: true },
    sd: { type: String, required: true },
    sc: { type: String, required: true },
    gst: { type: String, required: true },
    total: { type: String, required: true },
    pstatus: { type: String, default: "Pending" },
    bstatus: { type: String, default: "Pending" },
});

module.exports = mongoose.model("booking", bookSchema);