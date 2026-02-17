const mongoose = require("mongoose");
const validator = require("validator");
const { userRoles } = require("../utilty/user-roles.js");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"]
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    token: {
        type: String,
    },
    role: {
        type: String,
        enum: [userRoles.USER, userRoles.ADMIN, userRoles.MANAGER],
        default: userRoles.USER
    },
    avatar: {
        type: String,
        default: "./uploads/491949468_122227264226231140_6737147760321036211_n.jpg"
    }    
})

module.exports = mongoose.model("User", userSchema);