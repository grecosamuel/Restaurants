// Required Modules
const express = require("express");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");
const path = require("path");
const bodyParser = require("body-parser");

// Load .env config
dotenv.config();

// MongoDB Connection
const mongoClient = new MongoClient(process.env.MONGODB_URL);

async function mongoInit(){
    await mongoClient.connect( (err, res) => {
        if (err) throw err;
        console.log("MongoDB Connected... !");
    });

    db = await mongoClient.db("sample_restaurants");

    return db;
}

let db = mongoInit();


// Express Config
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static("public"))

async function getRestaurants(req, res, next){
    let restaurants = await db.collection("restaurants").find().limit(5).toArray();
    let neigh = await db.collection("neighborhoods").find().toArray();
    res.locals.restaurants = restaurants;
    res.locals.neigh = neigh;
    next();
}

app.get("/page/:n", getRestaurants, async (req, res) => {
   let { n } = req.params;
   n = Number(n);

   

    res.render("index2", {
        pageTitle: "Demo",
        neighborhoods: res.locals.neigh,
        restaurants: res.locals.restaurants
    })
});


app.listen(process.env.PORT, () => {
    console.log(`Listen on port ${process.env.PORT}...`)
})
