const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const db = require('../db');

function isAuthenticated(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

router.get('/', isAuthenticated, async (req, res) => {
    const [containers] = await db.promise().query('SELECT * FROM containers');
    res.json(containers);
});

router.post(
    '/',
    isAuthenticated,
    [
        check('identifier').notEmpty().withMessage('Identifier is required'),
        check('size').isIn(['S', 'M', 'L']).withMessage('Invalid container size'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { identifier, size } = req.body;
        const capacity = size === 'S' ? 2 : size === 'M' ? 4 : 6;
        const [result] = await db.promise().query('INSERT INTO containers (identifier, size, capacity) VALUES (?, ?, ?)', [identifier, size, capacity]);
        res.status(201).json({ id: result.insertId, identifier, size, capacity });
    }
);

router.delete('/:containerId', isAuthenticated, async (req, res) => {
    const { containerId } = req.params;
    await db.promise().query('DELETE FROM containers WHERE id = ?', [containerId]);
    res.status(204).send();
});

router.get('/:containerId/boxes', isAuthenticated, async (req, res) => {
    const { containerId } = req.params;
    const [boxes] = await db.promise().query('SELECT * FROM boxes WHERE container_id = ?', [containerId]);
    res.json(boxes);
});

router.post(
    '/:containerId/boxes',
    isAuthenticated,
    [
        check('weight').isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
        check('product_name').notEmpty().withMessage('Product name is required'),
        check('product_image').optional({ checkFalsy: true }).isURL().withMessage('Invalid product image URL'),
        check('is_flammable').isBoolean().withMessage('Is flammable must be a boolean value'),
        check('is_perishable').isBoolean().withMessage('Is perishable must be a boolean value'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { containerId } = req.params;
        const { weight, product_name, product_image, is_flammable, is_perishable } = req.body;
        const [result] = await db.promise().query('INSERT INTO boxes (weight, product_name, product_image, is_flammable, is_perishable, container_id) VALUES (?, ?, ?, ?, ?, ?)', [weight, product_name, product_image, is_flammable, is_perishable, containerId]);
        res.status(201).json({ id: result.insertId, weight, product_name, product_image, is_flammable, is_perishable, container_id: containerId });
    }
);
