const router = require("express").Router();
const path = require('path')
const dotenv = require('dotenv')
const protected = require('../feature/auth/auth.middleware')
const f1 = (req,res,next) =>{
    console.log(`test logger ${req.method} : ${req.url} `);
    next()
}
router.use(f1)
router.get('/demo/v1',(req,res) => {res.json({ok : true})})

// router.use('/api')
router.use('/message',protected,require('./room.route'))
router.use('/auth',require('../feature/auth/auth.route'))
module.exports = router