var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/loginDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;

db.on('error', console.error.bind(console, "Connection error:"));
db.once('open', () => {
    console.log("Connected to the database successfully");
});

// Sign-up route
app.post("/sign-up", (req, res) => {
    console.log(req.body);
    const { name, email, password, confirmPassword } = req.body;

    // Optional: Basic validation
    if (!name || !email || !password || password !== confirmPassword) {
        return res.status(400).send("Invalid input or passwords do not match.");
    }

    const data = {
        name,
        email,
        password,
        confirmPassword
    };

    db.collection('users').insertOne(data, (err, collection) => {
        if (err) {
            console.error("Insert failed:", err);
            return res.status(500).send("Database insert failed.");
        }
        console.log("Record inserted successfully");
        return res.redirect('login.html');
    });
});

// Root route
app.get("/", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.redirect('index.html');
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.collection('users').findOne({ email: email }, (err, user) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Internal server error.");
        }

        if (!user) {
        return res.redirect('login.html');
        }

        if (user.password !== password) {
        return res.redirect('login.html');
        }

        // Success!
        return res.redirect('home.html');
    });
});

// Start server
app.listen(3000, () => {
    console.log("Listening on port 3000.");
});
