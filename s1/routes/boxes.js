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

router.get('/:boxId', isAuthenticated, async (req, res) => {
    const { boxId } = req.params;
    const [[box]] = await db.promise().query('SELECT * FROM boxes WHERE id = ?', [boxId]);
    if (!box) {
        return res.status(404).send('Box not found');
    }
    res.json(box);
});

router.put(
    '/:boxId',
    isAuthenticated,
    [
        check('weight').isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
        check('product_name').notEmpty().withMessage('Product name is required'),
        check('product_image').optional({ checkFalsy: true }).isURL().withMessage('Invalid product image URL'),
        check('is_flammable').isBoolean().withMessage('Is flammable must be a boolean value'),
        check('is_perishable').isBoolean().withMessage('Is perishable must be a boolean value'),
        check('container_id').isInt({ min: 1 }).withMessage('Container ID must be a positive integer'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { boxId } = req.params;
        const { weight, product_name, product_image, is_flammable, is_perishable, container_id } = req.body;
        await db.promise().query('UPDATE boxes SET weight = ?, product_name = ?, product_image = ?, is_flammable = ?, is_perishable = ?, container_id = ? WHERE id = ?', [weight, product_name, product_image, is_flammable, is_perishable, container_id, boxId]);
        res.status(204).send();
    });

router.delete('/:boxId', isAuthenticated, async (req, res) => {
    const { boxId } = req.params;
    await db.promise().query('DELETE FROM boxes WHERE id = ?', [boxId]);
    res.status(204).send();
});

module.exports = router;
