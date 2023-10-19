const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/User.js");
const Exercise = require("./models/Exercise.js");
require("dotenv").config();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

rundb();

app.post("/api/users", async (req, res) => {
    const name = req.body.username;

    const newUser = await User.create({ username: name });
    res.json({ username: newUser.username, _id: newUser._id });
});

app.post("/api/users/:_id/exercises", async (req, res) => {
    const userId = req.params._id;
    const { description, duration, date } = req.body;

    const currentUser = await User.findById(userId);
    if (!currentUser) return res.json({ Error: "No user was found by given id" });

    const newExercise = new Exercise({
        userId: currentUser._id,
        description: description,
        duration: duration,
        date: date ? new Date(date) : new Date(),
    });

    await newExercise.save();

    res.json({
        _id: currentUser._id,
        username: currentUser.username,
        description: newExercise.description,
        duration: newExercise.duration,
        date: new Date(newExercise.date).toDateString(),
    });
});

app.get("/api/users", async (req, res) => {
    const allUsers = await User.find();
    const outputUsers = await allUsers.map((user) => {
        return {
            _id: user._id,
            username: user.username,
        };
    });

    res.send(outputUsers);
});

app.get("/api/users/:_id/logs", async (req, res) => {
    const fromDate = new Date(req.query.from);
    const toDate = new Date(req.query.to);
    const outputLimit = req.query.limit;

    const userId = req.params._id;
    const currentUser = await User.findById(userId);

    if (!currentUser) return res.json({ Error: "No user found by given id" });

    const allUserExercises = await Exercise.find({ userId: userId });

    let log = [];

    for (let i = 0; i < allUserExercises.length; i++) {
        if (outputLimit && log.length >= outputLimit) {
            break;
        }
        if (fromDate && allUserExercises[i].date < fromDate) {
            continue;
        }
        if (toDate && allUserExercises[i].date > toDate) {
            continue;
        }

        log.push({
            description: allUserExercises[i].description,
            duration: allUserExercises[i].duration,
            date: new Date(allUserExercises[i].date).toDateString(),
        });
    }

    res.json({
        _id: currentUser._id,
        username: currentUser.username,
        count: log.length,
        log: log,
    });
});

async function rundb() {
    await mongoose.connect(process.env.MONGO_URI);
    const connection = mongoose.connection;

    (await connection.readyState) == 1 ? console.log("Connected to db") : console.log("Error occured connecting to db");
}

const listener = app.listen(3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
});
