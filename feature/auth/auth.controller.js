const authService = require('./auth.service')

exports.register = async (req,res,next) => {
    try {
        const register = await authService.register(req.body)
        res.status(200).json(register)
    } catch (error) {
        next(error)
    }
}
exports.login = async (req,res,next) => {
    try {
        const login = await authService.login(req.body)
        res.status(200).json(login)
    } catch (error) {
        next(error) 
    }
}