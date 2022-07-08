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

app.get("/", async (req, res) => {
   let neigh = await db.collection("neighborhoods").find().toArray();
   
    let restaurants = await db.collection("restaurants").find().limit(10).toArray();

    res.render("index2", {
        pageTitle: "Demo",
        neighborhoods: neigh,
        restaurants: restaurants
    })
});


app.listen(process.env.PORT, () => {
    console.log(`Listen on port ${process.env.PORT}...`)
})
