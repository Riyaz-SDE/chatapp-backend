const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {User} = require('../../models/')
const {AppError} = require('../../routes/errorhalder')

function createToken(user){
    return jwt.sign(
        // id, secret_key, expires_in
        {id : user.id},process.env.JWT_SECRET,
        {expiresIn : process.env.JWT_EXPIRES_IN}
    )
}

// integrate body elements inside this services
async function register({name,password}) {
    // find name exist or not
    // hash password
    // create user
    // return credentials
    return {}
}

async function login({name,password}) {
    // find user exist
    // check password
    // return credentials
    return {}
}


module.exports = { register, login}