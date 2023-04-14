const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');


const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD_HASH = '$2b$10$TBzQDO6HEA6EY/rNWxhJD.Ih81FE6FYMTrKLzbVBmH1rG9JWySfZ6'; //hashed slaptazodis 'admin123' arba '123'

function isAuthenticated(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

router.post(
    '/login',
    [
        check('username').notEmpty().withMessage('Username is required'),
        check('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        if (username === ADMIN_USERNAME && (await bcrypt.compare(password, ADMIN_PASSWORD_HASH))) {
            req.session.loggedin = true;
            res.status(200).send('Logged in');
        } else {
            res.status(401).send('Incorrect username or password');
        }
    }
);

router.post('/logout', isAuthenticated, (req, res) => {
    req.session.destroy();
    res.status(200).send('Logged out');
});

module.exports = router;
