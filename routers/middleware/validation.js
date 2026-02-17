const { body } = require('express-validator');

const validation = () => {
    return [
        body('title')
        .notEmpty()
        .withMessage("title is required")
        .bail()
        .isLength({min: 2})
        .withMessage("title chars are lower than 2")
        .isLength({max: 14})
        .withMessage("title chars are more than 14")
    ]
}

module.exports = validation;