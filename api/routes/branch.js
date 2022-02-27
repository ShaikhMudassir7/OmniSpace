const express = require("express")
const router = express.Router()
var mongoose = require("mongoose");

const Branch = require("../models/branch")

router.get("/", (req, res) => {
    if (req.session.email) {
        Branch.find().select("bname badd bank")
            .exec()
            .then(docs => {
                console.log(docs)
                res.render('admin/branch/branch', { branchData: docs })
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

router.get("/add-branch", (req, res) => {
    if (req.session.email) {
        res.render('admin/branch/add-branch')
    } else {
        res.render('admin/500')
    }
});

router.post("/add-branch", (req, res, next) => {
    var branchData = new Branch({
        _id: new mongoose.Types.ObjectId(),
        bname: req.body.bname,
        badd: req.body.badd,
        bank: req.body.bank
    })
    branchData.save().then(result => {
        res.redirect('/branch')
    })
});

router.get("/edit-branch/(:id)", (req, res) => {
    Branch.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.render('admin/branch/edit-branch', { branchData: doc })
        } else {
            res.redirect('/try-again')
        }
    })
});

router.post("/edit-branch/:branchID", (req, res) => {
    const id = req.params.branchID
    Branch.updateMany({ _id: id }, { $set: req.body })
        .exec()
        .then(result => {
            console.log(result)
            res.redirect("/branch")
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
});

router.get("/delete-branch/(:id)", (req, res, next) => {
    Branch.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/branch')
        } else {
            res.redirect('/try-again')
        }
    })
});

module.exports = router