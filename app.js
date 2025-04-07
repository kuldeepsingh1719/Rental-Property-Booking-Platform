const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMAte = require("ejs-mate");
const expressError = require("./utils/expressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");




const mongo_url = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(mongo_url);
};

app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMAte);
app.use(express.static(path.join(__dirname, "/public")));


const sessionOptions = {
    secret: "musupersecretcode",
    resave: false,
    saveUninitialized: true,
    cokokie: {
        expires: Date.now() + 7 * 24 * 60 * 60 *1000,
        maxAge: 7 * 24 * 60 * 60 *1000,
        httpOnly: true,
    },
};

app.get("/", (req, res) => {
    res.send("Hii i am root");
});


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "abcd@123.com",
//         username: "aabbccdd",
//     });

//     let registerUser = await User.register(fakeUser, "helloworld");
//     res.send(registerUser);
// })

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter)

app.all("*", (req, res, next) => {
    next(new expressError(404, "Page not Found!"));
});

app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Somthing went wrong!"} = err;
    res.status(statusCode).render("error.ejs", { message })
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});