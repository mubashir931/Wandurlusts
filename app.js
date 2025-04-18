
if(process.env.NODE_ENV != "production") {
  require('dotenv').config();
}

const express = require("express");
const app = express();
const router = express.Router({mergeParams: true});
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const session = require("express-session");
const flash = require("connect-flash");
const wrapAsync = require("./utils/wrapAsync.js");
const {storage} = require("./cloudConfig.js");
const upload = ({storage});

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";


main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOption = {
  secret: "mysupersecret",
  resave: false,
  saveUninitialized: true,
  Cookie: {
    expires: Date.now() + 7 * 60 * 60 * 24 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  },
};

app.use(session(sessionOption));
app.use(flash());









app.use("/listings", listingRouter);
app.get("/", (req, res) => {
  res.send("this is a home route")
})
app.all("*",(req, res, next) => {
  next(new ExpressError(404, "page not found!"))
})

app.use((err, req, res, next) => {
  let {statusCode=500, message = "something went wrong"} = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("listings/error.ejs", { message });
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});