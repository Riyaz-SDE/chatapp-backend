const { checkSchema } = require("express-validator");

const messageSchema = checkSchema({
    userId : {
        isInt : {
            errorMessage : "user id must be number"
        },
        toInt : true
    },
    targetId : {
        isInt : {
            errorMessage : "user id must be number"
        },
        toInt : true,
        custom : {
            options : (targetId, {req}) => {
                if(req.body.userId === targetId){
                    throw new Error('you connot perform this action')
                }
                return true
            }
        }
    },
    message : {
        isString : {
            errorMessage : "message must be string"
        },
        isLength:{
            options : { min: 1, max:300 }
        }
    }
})

module.exports = messageSchema