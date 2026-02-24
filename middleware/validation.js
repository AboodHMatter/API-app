const { body } = require('express-validator');

const courseValidation = () => {
    return [
        body('title')
            .notEmpty()
            .withMessage("title is required")
            .bail()
            .isLength({ min: 2 })
            .withMessage("title chars are lower than 2")
            .isLength({ max: 14 })
            .withMessage("title chars are more than 14")
    ];
};
const firstNameValidation = () => {
    return [
        body('firstName')
            .notEmpty()
            .withMessage("firstName is required")
            .bail()
            .isLength({ min: 2 })
            .withMessage("firstName chars are lower than 2")
            .isLength({ max: 14 })
            .withMessage("firstName chars are more than 14")
    ];
};
const lastNameValidation = () => {
    return [
        body('lastName')
            .notEmpty()
            .withMessage("lastName is required")
            .bail()
            .isLength({ min: 2 })
            .withMessage("lastName chars are lower than 2")
            .isLength({ max: 14 })
            .withMessage("lastName chars are more than 14")
    ];
};
const emailValidation = () => {
    return [
        body('email')
            .notEmpty()
            .withMessage("email is required")
            .bail()
            .isEmail()
            .withMessage("email is invalid")
    ];
};
const passwordValidation = () => {
    return [
        body('password')
            .notEmpty()
            .withMessage("password is required")
            .bail()
            .isLength({ min: 6 })
            .withMessage("password chars are lower than 6")
    ];
};
module.exports = { courseValidation, firstNameValidation, lastNameValidation, emailValidation, passwordValidation };