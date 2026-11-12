const { validationResult } = require("express-validator")
const logger = require("./logger")

const validate = (req,res,next) => {
    const errors = validationResult(req)
    if(errors.isEmpty()){
        return next()
    }
    errors.array().map( err => logger.error(err.msg) )

    return res.status(400).json({
        status : 'fail',
        error : errors.array().map(err => ({
            field : err.path,
            message : err.msg
        }))
    })
}

module.exports = validate