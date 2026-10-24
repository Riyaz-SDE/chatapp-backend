class AppError extends Error{
    constructor(status,message,details){
        super(message),
        this.message = message,
        this.details = details
    }
}


const errHandler = (err,req,res,next) => {
    let status = err.status || 500
    let message = err.message

    if(status >= 500) {console.error(err); message = "Internal Server Error"}
    res.status(status).json({message : err.message, details : err.details})
}


module.exports = { AppError, errHandler}