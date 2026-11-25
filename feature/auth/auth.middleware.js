const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const { AppError } = require('../../routes/errorhalder');

module.exports = async (req, res, next) => {
    try {
        //middleware logic
        console.log('auth middleware current');
        console.log(req.headers.authorization.split(' ')[1]);
        
        req.customToken = req.headers.authorization.split(' ')[1] 
        next()
    } catch (error) {
        next(error)
    }
}