const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
    {
        userId: String,
        description: String,
        duration: Number,
        date: Date,
    },
    { collection: "exercises" }
);

const Exercise = mongoose.model("Exercise", exerciseSchema);
module.exports = Exercise;
