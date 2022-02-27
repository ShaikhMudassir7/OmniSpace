const express = require("express")
const router = express.Router()
var mongoose = require("mongoose");

const Vendor = require("../models/vendor");

router.get("/", (req, res) => {
    if (req.session.email) {
        Vendor.find().select("vendorname type vadd cperson phone GST website notes")
            .exec()
            .then(docs => {
                res.render('admin/vendors/vendors', { vendorData: docs })
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({
                    error: err
                })
            })
    } else {
        res.render('admin/500')
    }
});

router.get("/add-vendor", (req, res) => {
    if (req.session.email) {
        res.render('admin/vendors/add-vendor')
    } else {
        res.render('admin/500')
    }
});

router.post("/add-vendor", (req, res, next) => {
    var vendorData = new Vendor({
        _id: new mongoose.Types.ObjectId(),
        vendorname: req.body.vendorname,
        type: req.body.type,
        cperson: req.body.cperson,
        vadd: req.body.vadd,
        phone: req.body.phone,
        GST: req.body.GST,
        website: req.body.website,
        notes: req.body.notes,
    })
    vendorData.save().then(result => {
        res.redirect('/vendors')
    })
});

router.get("/edit-vendor/(:id)", (req, res) => {
    Vendor.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.render('admin/vendors/edit-vendor', { vendorData: doc })
        } else {
            res.redirect('/try-again')
        }
    })
});

router.post("/edit-vendor/:vendorID", (req, res) => {
    const id = req.params.vendorID
    Vendor.updateMany({ _id: id }, { $set: req.body })
        .exec()
        .then(result => {
            console.log(result)
            res.redirect("/vendors")
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
});

router.get("/delete-vendor/(:id)", (req, res, next) => {
    Vendor.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/vendors')
        } else {
            res.redirect('/try-again')
        }
    })
});

module.exports = router