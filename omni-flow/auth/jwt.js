const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default_dev_jwt_key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'default_dev_refresh_key';

function generateTokens(payload) {
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
    
    return { accessToken, refreshToken };
}

function verifyAccessToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, REFRESH_SECRET);
    } catch (error) {
        return null;
    }
}

module.exports = {
    generateTokens,
    verifyAccessToken,
    verifyRefreshToken
};