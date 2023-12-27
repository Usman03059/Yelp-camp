if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()

}
const express = require('express')
const path = require('path')
const ExpressError = require('./utils/ExpressError')
const ejsmate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const campgroundRouter = require('./routers/campground')
const userRouter = require('./routers/user')
const reviewRouter = require('./routers/review')
const User = require('./models/user')
const passport = require('passport')
const localstrategy = require('passport-local')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const mongoose = require('mongoose')
const MongoDBStore = require("connect-mongo");
const DBURL=process.env.DB_URL || "mongodb://127.0.0.1:27017/Yelp-camp"
mongoose.connect(DBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true

})
const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection Error"));
db.once('open', () => {
    console.log("Connection database")
})



const app = express();
app.engine('ejs', ejsmate)




app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(methodOverride('_method'))
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}));
const secret = process.env.SECRET ||'Thisisasceret'

const store = MongoDBStore.create({
    mongoUrl: DBURL,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})
const sessionconfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionconfig))
app.use(flash());
app.use(helmet())



const scriptSrcUrls = [
    // "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dnhum76lr/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc: ["https://res.cloudinary.com/dnhum76lr/"],
            childSrc: ["blob:"]
        },
    })
);

app.use(passport.session());
passport.use(new localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentuser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
app.use('/', userRouter)
app.use('/campgrounds', campgroundRouter)
app.use('/campgrounds/:id/review', reviewRouter)


app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'usman@gmail.com', username: 'usman' })
    const newreg = await User.register(user, 'chicken')
    res.send(newreg);
})

app.get('/', (req, res) => {
    res.render('home')
});


app.all('*', (req, res, next) => {

    next(new ExpressError('Page not found!!', 404));
});
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (err) {
        req.flash('error', "Campground not found");
        console.log(err)
        return res.redirect(`/campgrounds`);
    }

    if (!err.message) err.message = 'OH no something went wrong!!'
    res.status(statusCode).render('Error', { err });

});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Connection open Express')
})