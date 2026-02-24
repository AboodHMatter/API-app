const mongoose = require("mongoose");
const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Price must be positive"]
    },
    category: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now

    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    }
});

courseSchema.index({ _id: -1, createdAt: -1 });

module.exports = mongoose.model("Course", courseSchema);