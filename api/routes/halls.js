const express = require("express")
const router = express.Router()
var mongoose = require("mongoose");

const Halls = require("../models/halls")
const Branch = require("../models/branch")

router.get("/", (req, res) => {
    if (req.session.email) {
        Halls.find().select("branchName hallname rent security scharge GSTamount")
            .exec()
            .then(docs => {
                res.render('admin/halls/halls', { hallsData: docs })
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

router.get("/add-hall", (req, res) => {
    if (req.session.email) {
        Branch.find().select("bname")
            .exec()
            .then(docs => {
                res.render('admin/halls/add-hall', { branchData: docs })
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

router.post("/add-hall", (req, res, next) => {

    var hallData = new Halls({
        _id: new mongoose.Types.ObjectId(),
        branchName: req.body.branchName,
        hallname: req.body.hallname,
        rent: req.body.rent,
        security: req.body.security,
        scharge: req.body.scharge,
        GSTamount: req.body.GSTamount,
    })
    hallData.save().then(result => {
        res.redirect('/halls')
    })
});

router.get("/edit-hall/(:id)", (req, res) => {
    Halls.findById(req.params.id, (err, doc) => {
        if (!err) {
            Branch.find().select("bname")
                .exec()
                .then(docs => {
                    res.render('admin/halls/edit-hall', { hallData: doc, branchData: docs })
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).json({
                        error: err
                    })
                })
        } else {
            res.redirect('/try-again')
        }
    })
});

router.post("/edit-hall/:hallID", (req, res) => {
    const id = req.params.hallID
    Halls.updateMany({ _id: id }, { $set: req.body })
        .exec()
        .then(result => {
            console.log(result)
            res.redirect("/halls")
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
});

router.get("/delete-hall/(:id)", (req, res, next) => {
    Halls.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/halls')
        } else {
            res.redirect('/try-again')
        }
    })
});

module.exports = router