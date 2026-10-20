/**
 * this file used for 1-1 message post retrival
 */

const messageSchema = require('../config/messageSchema');

const router = require('express').Router()

router.use((req,res,next)=>{
    console.log('authservice');
    next()
})

// validate input data - userId 
router.post('/dm',
    [messageSchema,validator]
    ,(req,res) => {
        res.status(200).json({message : 'done'})
})

