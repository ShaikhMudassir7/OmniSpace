var express = require("express");
const http = require("http");
const dotenv = require("dotenv");
dotenv.config();
const session = require('express-session');

// Importing mongoose module
var mongoose = require("mongoose");
const port = process.env.PORT;
const app = express();

const adminRoute = require("./api/routes/admin")
const branchRoute = require("./api/routes/branch")
const hallRoute = require("./api/routes/halls")
const userRoute = require("./api/routes/user")
const vendorRoute = require("./api/routes/vendors")

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

app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/img'))
app.use('/font', express.static(__dirname + 'public/font'))
app.use('/vendor', express.static(__dirname + 'public/vendor'))
app.use('/components', express.static(__dirname + 'public/components'))
app.use('/uploads', express.static(__dirname + 'public/uploads'))

app.set('views', './views')
app.set('view engine', 'ejs')

app.use('/', userRoute)
app.use('/admin', adminRoute)
app.use('/branch', branchRoute)
app.use('/halls', hallRoute)
app.use('/vendors', vendorRoute)

const server = http.createServer(app);
server.listen(port, () => {
    console.log("Listening on port " + port);
});