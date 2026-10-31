const { checkSchema } = require("express-validator");


const inputSchemaforMessage = {
    userId : {
        isInt : {
            errorMessage : "user id must be number"
        },
        bail: true,
        toInt : true
    },
    roomId : {
        isInt : {
            errorMessage : "room id must be number"
        },
        bail: true,
        toInt : true,
        custom : {
            options : (targetId, {req}) => {
                if (Array.isArray(targetId)){
                    throw new Error('id must be single')
                    // return { errorMessage : "user id must be number
                }
                if(req.body.userId === targetId){
                    throw new Error('you cannot perform this action')
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

module.exports = inputSchemaforMessage