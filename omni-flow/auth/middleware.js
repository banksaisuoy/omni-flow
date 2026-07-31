const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// OWASP Top 10 Safeguards (Helmet provides basic security headers)
const applyOWASPSafeguards = (app) => {
    app.use(helmet());
    
    // Additional basic headers for security
    app.use((req, res, next) => {
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        res.setHeader('Content-Security-Policy', "default-src 'self'");
        next();
    });
};

// Rate limiting middleware
const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again after 15 minutes.'
});

const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Limit each IP to 5 login requests per window
    message: 'Too many login attempts, please try again after 15 minutes.'
});

module.exports = {
    applyOWASPSafeguards,
    apiRateLimiter,
    loginRateLimiter
};