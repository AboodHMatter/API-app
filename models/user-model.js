const mongoose = require("mongoose");
const validator = require("validator");
const { userRoles } = require("../utils/user-roles.js");

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
        required: [true, "Password is required"],
        select: false
    },
    role: {
        type: String,
        enum: [userRoles.USER, userRoles.ADMIN, userRoles.MANAGER],
        default: userRoles.USER

    },
    avatarUrl: {
        type: String,
        default: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
    },
    avatarPublicId: {
        type: String,
    },
    refreshTokens: [String]
}, { timestamps: true });

userSchema.index({ _id: -1, createdAt: -1 });

userSchema.set("toJSON", {
    transform: function (doc, ret) {
        delete ret.password;
        return ret;
    }
});

module.exports = mongoose.model("User", userSchema);