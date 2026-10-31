const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('../routes/errorhalder');

module.exports = async (req, res, next) => {
    try {
        //middleware logic
        console.log('auth middleware');
    } catch (error) {
        next(error)
    }
}