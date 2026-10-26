const { checkSchema } = require("express-validator");


const inputSchemaforDM = {
    userId : {
        isInt : {
            errorMessage : "user id must be number"
        },
        bail: true,
        toInt : true
    },
    targetId : {
        isInt : {
            errorMessage : "user id must be number"
        },
        bail: true,
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
        bail: true,
        isLength:{
            options : { min: 1, max:300 }
        }
    }
}
const messageSchema = checkSchema(inputSchemaforDM)

module.exports = messageSchema