// Required Modules
const express = require("express");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");
const path = require("path");
const bodyParser = require("body-parser");
const paginate = require("jw-paginate");
const nodeCache = require("node-cache");


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

// Cache config
const myCache = new nodeCache({ stdTTL: 600 });

// Functions
async function getNeigh(){
    let neigh = await db.collection("neighborhoods").find().toArray();
    return neigh;
}

async function getRestaurants(){
    let restaurants = await db.collection("restaurants").find().toArray();
    return restaurants;
}


async function middlewareGetData(req, res, next){


    let neighFromCache = myCache.get("allNeigh")
    let restaurantsFromCache = myCache.get("allRestaurants");

    if (neighFromCache == null){
        let neigh = await getNeigh();
        console.log("Get neigh from MONGODB...");
        myCache.set("allNeigh", neigh, 600);
        res.locals.neigh = neigh;
    }
    else {
        console.log("Get neigh from cache...");
        res.locals.neigh = neighFromCache;
    }

    if (restaurantsFromCache == null){
        let restaurants = await getRestaurants();
        console.log("Get restaurants from MONGODB...");
        myCache.set("allRestaurants", restaurants, 600);
        res.locals.restaurants = restaurants;
    }
    else {
        console.log("Get restaurants from cache...");
        res.locals.restaurants = restaurantsFromCache;
    }

    next();
}

app.get("/page/:n", middlewareGetData, async (req, res) => {
   let { n } = req.params;
   n = Number(n);

   let pages = paginate(res.locals.restaurants.length, n, 20);


    res.render("index2", {
        pageTitle: "Demo",
        neighborhoods: res.locals.neigh,
        restaurants: res.locals.restaurants.slice(pages.startIndex, pages.endIndex),
        q_pages: pages.pages
    })
});


app.listen(process.env.PORT, () => {
    console.log(`Listen on port ${process.env.PORT}...`)
})
