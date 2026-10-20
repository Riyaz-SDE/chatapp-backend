const { validationResult } = require("express-validator")

const validate = (req,res,next) => {
    const errors = validationResult(req)

    if(errors.isEmpty()){
        return next()
    }

    return res.status(400).json({
        status : 'fail',
        error : errors.array().map(err => ({
            field : err.path,
            message : err.message
        }))
    })
}

module.exports = validate