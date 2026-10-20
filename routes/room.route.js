/**
 * this file used for 1-1 message post retrival
 */

const messageSchema = require('../config/messageSchema');
const validate = require('../config/validate');

const router = require('express').Router()

router.use((req,res,next)=>{
    console.log('authservice');
    next()
})

// validate input data - userId 
router.post('/dm',
    messageSchema,validate
    ,(req,res) => {
        res.status(200).json({message : 'done'})
        // check target id exist
        // return room
        // send message
})

module.exports = router
