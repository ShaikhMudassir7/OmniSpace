var express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const session = require('express-session');
const pdfGenerator = require('pdfkit')

// Importing mongoose module
var mongoose = require("mongoose");
const port = 3000;
const app = express();

const Admin = require("./api/models/admin")
const Branch = require("./api/models/branch")
const Vendor = require("./api/models/vendor");
const Halls = require("./api/models/halls");

const User = require("./api/models/user");
const Book = require("./api/models/book");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

mongoose.connect("mongodb+srv://asimsiddiqui:" + process.env.MONGO_ATLAS_PW + "@cluster0.7dy8x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
var db = mongoose.connection;

app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/img'))
app.use('/font', express.static(__dirname + 'public/font'))
app.use('/vendor', express.static(__dirname + 'public/vendor'))
app.use('/components', express.static(__dirname + 'public/components'))

app.set('views', './views')
app.set('view engine', 'ejs')

// Handling the get request
app.get("/admin", (req, res) => {
    res.render('admin/login');
});

app.post("/admin", (req, res) => {
    console.log(req.body)
    const email = req.body.email;
    const pass = req.body.pass;

    Admin.find({
            email: email,
            pass: pass,
        })
        .exec()
        .then((user) => {
            //console.log(user);
            if (user.length < 1) {
                res.status(404).json({
                    message: "Not found",
                });
            } else {
                const token = jwt.sign({
                        email: user[0].email,
                        userId: user[0]._id,
                    },
                    process.env.JWT_KEY, {}
                );
                req.session.loggedin = true;
                req.session.email = email;
                res.status(200).redirect("/dashboard");
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({
                message: error,
            });
        });
});

app.get("/dashboard", (req, res) => {
    if (req.session.email) {
        Book.find({
            pstatus: "Pending"
        }).exec().then(pstatus => {
            Book.find({
                bstatus: "Pending"
            }).exec().then(bstatus => {
                User.find().exec().then(users => {
                    Halls.find().exec().then(halls => {
                        res.render('admin/dashboard', { noofpen: pstatus.length, noofbook: bstatus.length, noofusers: users.length, noofhalls: halls.length })
                    })
                })
            })
        })
    } else {
        res.render('admin/500')
    }
});

app.get("/admins", (req, res) => {
    if (req.session.email) {
        Admin.find().select("name email mobile role branch")
            .exec()
            .then(docs => {
                res.render('admin/admins/admins', { adminData: docs })
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

app.get("/add-admin", (req, res) => {
    if (req.session.email) {
        Branch.find().select("bname")
            .exec()
            .then(docs => {
                res.render('admin/admins/add-admin', { branchData: docs })
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

app.get("/edit-admin/(:id)", (req, res) => {
    Admin.findById(req.params.id, (err, doc) => {
        if (!err) {
            Branch.find().select("bname")
                .exec()
                .then(docs => {
                    res.render('admin/admins/edit-admin', { adminData: doc, branchData: docs })
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

app.post("/add-admin", (req, res) => {
    var adminData = new Admin({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        mobile: req.body.mobile,
        email: req.body.email,
        pass: req.body.pass,
        role: req.body.role,
        branch: req.body.branch
    })
    adminData.save().then(result => {
        res.redirect("/admins")
    })
});

app.post("/edit-admin/:adminId", (req, res) => {
    const id = req.params.adminId
    Admin.updateMany({ _id: id }, { $set: req.body })
        .exec()
        .then(result => {
            console.log(result)
            res.redirect("/admins")
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
});

app.get("/delete-admin/(:id)", (req, res, next) => {
    Admin.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/admins')
        } else {
            res.redirect('/try-again')
        }
    })
});


app.get("/branch", (req, res) => {
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

app.get("/add-branch", (req, res) => {
    if (req.session.email) {
        res.render('admin/branch/add-branch')
    } else {
        res.render('admin/500')
    }
});

app.post("/add-branch", (req, res, next) => {
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

app.get("/edit-branch/(:id)", (req, res) => {
    Branch.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.render('admin/branch/edit-branch', { branchData: doc })
        } else {
            res.redirect('/try-again')
        }
    })
});

app.post("/edit-branch/:branchID", (req, res) => {
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

app.get("/delete-branch/(:id)", (req, res, next) => {
    Branch.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/branch')
        } else {
            res.redirect('/try-again')
        }
    })
});


app.get("/vendors", (req, res) => {
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

app.get("/add-vendor", (req, res) => {
    if (req.session.email) {
        res.render('admin/vendors/add-vendor')
    } else {
        res.render('admin/500')
    }
});

app.post("/add-vendor", (req, res, next) => {
    const vendorData = new Vendor(req.body)
    vendorData.save()
    res.redirect('/vendors')
});

app.get("/edit-vendor/(:id)", (req, res) => {
    Vendor.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.render('admin/vendors/edit-vendor', { vendorData: doc })
        } else {
            res.redirect('/try-again')
        }
    })
});

app.post("/edit-vendor/:vendorID", (req, res) => {
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

app.get("/delete-vendor/(:id)", (req, res, next) => {
    Vendor.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/vendors')
        } else {
            res.redirect('/try-again')
        }
    })
});


app.get("/halls", (req, res) => {
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

app.get("/add-hall", (req, res) => {
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

app.post("/add-hall", (req, res, next) => {
    const hallData = new Halls(req.body)
    hallData.save()
    res.redirect('/halls')
});

app.get("/edit-hall/(:id)", (req, res) => {
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

app.post("/edit-hall/:hallID", (req, res) => {
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

app.get("/delete-hall/(:id)", (req, res, next) => {
    Halls.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/halls')
        } else {
            res.redirect('/try-again')
        }
    })
});


app.get("/pending-payments", (req, res) => {
    if (req.session.email) {
        Book.find({
                pstatus: "Pending"
            }).select("cname cmob cadd hall bdate pbook total cat deco")
            .exec()
            .then(docs => {
                res.render('admin/reports/pending', { penData: docs })
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

app.get("/pending-bookings", (req, res) => {
    if (req.session.email) {
        Book.find({
                pstatus: "Completed",
                bstatus: "Pending"
            }).select("cname cmob cadd hall bdate pbook total cat deco")
            .exec()
            .then(docs => {
                res.render('admin/reports/bookings', { bookData: docs })
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

app.get("/booking-reports", (req, res) => {
    if (req.session.email) {
        Book.find({
                pstatus: "Completed",
                bstatus: "Completed"
            }).select("cname cmob cadd hall bdate pbook total cat deco pstatus bstatus")
            .exec()
            .then(docs => {
                res.render('admin/reports/bookreport', { bookData: docs })
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

app.get("/approve-payment/(:id)", (req, res) => {
    Book.findByIdAndUpdate(req.params.id, { pstatus: "Completed" }, (err, doc) => {
        if (!err) {
            res.redirect('/pending-payments')
        } else {
            res.redirect('/try-again')
        }
    })
});

app.get("/approve-booking/(:id)", (req, res) => {
    Book.findByIdAndUpdate(req.params.id, { bstatus: "Completed" }, (err, doc) => {
        if (!err) {
            res.redirect('/pending-bookings')
        } else {
            res.redirect('/try-again')
        }
    })
});

app.get("/unauthorized-access", (req, res) => {
    res.render('admin/500.ejs')
});

app.get("/try-again", (req, res) => {
    res.render('admin/404.ejs')
});


// User Section
app.get("/", (req, res) => {
    res.render('user/login');
});

app.post("/user-login", (req, res) => {
    const useremail = req.body.useremail;
    const password = req.body.password;

    User.find({
            useremail: useremail,
            password: password,
        })
        .exec()
        .then((user) => {
            console.log(user)
            if (user.length < 1) {
                res.status(404).json({
                    message: "User Not found",
                });
            } else {
                const token = jwt.sign({
                        email: user[0].email,
                        userId: user[0]._id,
                    },
                    process.env.JWT_KEY, {}
                );
                req.session.loggedin = true;
                req.session.userId = user[0]._id;
                res.status(200).redirect("/home?err=false");
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({
                message: error,
            });
        });
});


app.get("/register", (req, res) => {
    res.render('user/register');
});

app.post("/check-availability", (req, res) => {
    Book.find({
            hall: req.body.hall,
            bdate: req.body.bdate,
        })
        .exec()
        .then((book) => {
            if (book.length < 1) {
                res.redirect('/new-booking?hallname=' + req.body.hall + '&bookDate=' + req.body.bdate)
            } else {
                res.redirect('/home?err=true')
            }
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({
                message: error,
            });
        });
});

app.get("/new-booking", (req, res) => {
    if (req.session.loggedin) {
        Halls.find({
            hall: req.query.hallname
        }).exec().then((result) => {
            Vendor.find({
                type: "Decorator",
            }).select("vendorname").exec().then(deco => {
                Vendor.find({
                    type: "Caterers",
                }).select("vendorname").exec().then(cat => {
                    res.render('user/book', { hallData: result[0], decoData: deco, catData: cat, bdate: req.query.bookDate });
                })
            })
        })
    } else {
        res.redirect('/access-not-allowed');
    }
});

app.post("/new-booking", (req, res) => {
    console.log(req.body)
    var bookData = new Book({
        _id: new mongoose.Types.ObjectId(),
        userID: req.session.userId,
        cname: req.body.cname,
        cmob: req.body.cmob,
        cmail: req.body.cmail,
        cadd: req.body.cadd,
        hall: req.body.hall,
        bdate: req.body.bdate,
        pbook: req.body.pbook,
        noofdays: req.body.noofdays,
        esd: req.body.esd,
        eed: req.body.eed,
        est: req.body.est,
        eet: req.body.eet,
        rname: req.body.rname,
        rmob: req.body.rmob,
        deco: req.body.deco,
        cat: req.body.cat,
        rent: req.body.rent,
        sd: req.body.sd,
        sc: req.body.sc,
        gst: req.body.gst,
        total: req.body.total,
    })
    bookData.save().then(result => {
        res.redirect('/booking')
    })
});

app.get("/delete-booking/(:id)", (req, res, next) => {
    Book.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect('/booking')
        }
    })
});

app.get("/booking", (req, res) => {
    if (req.session.loggedin) {
        Book.find({
                userID: req.session.userId
            }).select("bdate cname hall pbook total bstatus pstatus")
            .exec()
            .then(docs => {
                res.render('user/bookings', { bookData: docs })
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({
                    error: err
                })
            })
    } else {
        res.redirect('/access-not-allowed');
    }
});

app.post("/register", (req, res) => {
    var userData = new User({
        _id: new mongoose.Types.ObjectId(),
        username: req.body.username,
        usermob: req.body.usermob,
        useremail: req.body.useremail,
        password: req.body.password
    })
    userData.save().then(result => {
        res.redirect("/home?err=false")
    })
});

app.get("/home", (req, res) => {
    if (req.session.loggedin) {
        Halls.find().select("hallname")
            .exec()
            .then(docs => {
                res.render('user/home', { hallsData: docs, error: req.query.err })
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({
                    error: err
                })
            })
    } else {
        res.redirect('/access-not-allowed');
    }
});

app.get("/access-not-allowed", (req, res) => {
    res.render('user/500.ejs')
});

app.get("/generate-decorator/(:id)", (req, res) => {
    Book.findById(req.params.id, (err, doc) => {
        if (!err) {
            const fs = require('fs')
            let today = new Date().toLocaleDateString()
            let theOutput = new pdfGenerator
            theOutput.pipe(fs.createWriteStream('Decorator.pdf'))
            theOutput.fontSize(10).text('Date: ' + today, { align: 'right' });
            theOutput.font('Helvetica-Bold').text("To,")
            theOutput.text("The Secretary,")
            theOutput.text("M. H. Saboo Siddik Institute,")
            theOutput.text("Byculla, Mumbai - 400 008").moveDown()
            theOutput.text("Respected Sir,").moveDown()
            theOutput.font('Helvetica').text("I / We, " + doc.cname + ", the undersigned have to inform you that the Mandap Decoration / Electrical Illumination (with generator) etc for the function to be held in the " + doc.hall + " at the above institution on " + doc.bdate + " has been entrusted to your approved contractor namely.").moveDown()
            theOutput.font('Helvetica-Bold').text("Decorator Name: " + doc.deco).moveDown()
            theOutput.font('Helvetica').text("I / We have seen the rates as approved by you for the various items of illumination and Mandap Decoration.").moveDown()
            theOutput.text("I / We undertake to produce the receipt of full payment of the said Contractor within a week after the function or at the time of receiving the refund of the deposit amount at your office.").moveDown().moveDown().moveDown()
            theOutput.font('Helvetica-Bold').text("Yours Faithfully,").moveDown()
            theOutput.font('Helvetica').text("I / We, " + doc.deco + ", the undersigned your approved Mandap Decorator, confirm having accepted the contract for the function to be held on " + doc.bdate + " at your insitution.").moveDown().moveDown()
            theOutput.text("Notes: This form should be handed over to the Mandap Decorator " + doc.deco + " and should reach the office 15 days before the date of the function duly signed by the Contractor.").moveDown()
            theOutput.text("(a) Full Payment should be paid with the order for the hall.").moveDown()
            theOutput.end()
            theOutput.pipe(res)
        }
    })
});

app.get("/generate-caterer/(:id)", (req, res) => {
    Book.findById(req.params.id, (err, doc) => {
        if (!err) {
            const fs = require('fs')
            let today = new Date().toLocaleDateString()
            let theOutput = new pdfGenerator
            theOutput.pipe(fs.createWriteStream('Caterer.pdf'))
            theOutput.fontSize(10).text('Date: ' + today, { align: 'right' });
            theOutput.font('Helvetica-Bold').text("To,")
            theOutput.text("The Managing Trustee,")
            theOutput.text("M. H. Saboo Siddik Institute,")
            theOutput.text("Byculla, Mumbai - 400 008").moveDown()
            theOutput.text("Respected Sir,").moveDown()
            theOutput.font('Helvetica').text("I / We, " + doc.cname + ", the undersigned have to inform you that catering for the food of my function to be held on " + doc.hall + " has been given to your approved caterer " + doc.cat + ". Kindly allow them to enter in the hall to do the work.").moveDown().moveDown().moveDown()
            theOutput.font('Helvetica-Bold').text("Yours Faithfully,").moveDown()
            theOutput.font('Helvetica').text("I / We, " + doc.cat + ", the undersigned your approved Caterer, confirm having accepted the contract for the function to be held on " + doc.bdate + " at your insitution.").moveDown().moveDown()
            theOutput.end()
            theOutput.pipe(res)
        }
    })
});

app.get("/generate-booking/(:id)", (req, res) => {
    Book.findById(req.params.id, (err, doc) => {
        if (!err) {
            const fs = require('fs')
            let today = new Date().toLocaleDateString()
            let theOutput = new pdfGenerator
            theOutput.pipe(fs.createWriteStream('Booking.pdf'))
            theOutput.fontSize(10).text('Date: ' + today, { align: 'right' });
            theOutput.font('Helvetica-Bold').text("The Principal of Campus Incharge")
            theOutput.text("M. H. Saboo Siddik Institute of Engg & Technology")
            theOutput.text("8, Saboo Siddik Polytechnic Road,")
            theOutput.text("Byculla, Mumbai - 400 008").moveDown()
            theOutput.text("Sub: Booking of " + doc.hall).moveDown()
            theOutput.text("Respected Sir,").moveDown()
            theOutput.font('Helvetica').text("I / We, " + doc.cname + ", the undersigned hereby apply for booking of " + doc.hall + " from " + doc.bdate + " to " + doc.eed + " between " + doc.est + " to " + doc.eet).moveDown()
            theOutput.text("I / We have read the Terms and Condition for the booking of " + doc.hall + " of the institution and we agree to abide by the same.").moveDown()
            theOutput.text("In case of Emergency, the Management, Anjuman-I-Islam, possess full right to cancel My / Our said booking without assigning any reason. In such cases, I / We may be intimated in advance before the date of the said function / occasion.").moveDown()
            theOutput.text("You are hereby requested to allow me temporary usage of the said place as on date " + doc.bdate + " and for the purpose of " + doc.pbook).moveDown()
            theOutput.font('Helvetica-Bold').text("Thaking You!").moveDown()
            theOutput.font('Helvetica-Bold').text("Yours Sincerely,").moveDown().moveDown().moveDown()
            theOutput.font('Helvetica-Bold').text("Signature of the Applicant(s)")
            theOutput.text("--------------------------------------------------------------------------------------------------------------------------------")
            theOutput.font('Helvetica').text("The said " + doc.hall + " is available for the booking for the purpose of " + doc.pbook + " on " + doc.bdate).moveDown().moveDown().moveDown().moveDown()
            theOutput.font('Helvetica-Bold').text("I / C Hall and Ground")
            theOutput.text("--------------------------------------------------------------------------------------------------------------------------------")
            theOutput.font('Helvetica').text("Forwarded to the Management, Anjuman-I-Islam with necessary recommendation for seeking approval to allot " + doc.hall).moveDown().moveDown().moveDown().moveDown()
            theOutput.font('Helvetica-Bold').text("PRINCIPAL / CAMPUS INCHARGE")
            theOutput.text("--------------------------------------------------------------------------------------------------------------------------------")
            theOutput.font('Helvetica').text("Permitted / Not Permitted to allot " + doc.hall + " as per the details mentioned above.").moveDown().moveDown().moveDown().moveDown()
            theOutput.font('Helvetica-Bold').text("Hon. President / Hon. General Secretary")
            theOutput.font('Helvetica-Bold').text("Anjuman-I-Islam")
            theOutput.text("--------------------------------------------------------------------------------------------------------------------------------")
            theOutput.end()
            theOutput.pipe(res)
        }
    })
});

app.get("/logout-admin", (req, res) => {
    req.session.destroy();
    res.redirect("/admin")
});

app.get("/logout-user", (req, res) => {
    req.session.destroy();
    res.redirect("/")
});

// Starting the server on the 80 port
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});