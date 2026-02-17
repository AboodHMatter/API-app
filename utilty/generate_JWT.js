const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET
module.exports = async (payload) => {
    const token = await jwt.sign(payload, secretKey, { expiresIn: '100m' });
    return token;
}