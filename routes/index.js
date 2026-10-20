const router = require("express").Router();
const path = require('path')
const dotenv = require('dotenv')

const f1 = (req,res,next) =>{
    console.log(`test logger ${req.method} : ${req.url} `);
    next()
}
router.use(f1)
router.get('/demo/v1',(req,res) => {res.json({ok : true})})

// router.use('/api')
router.use('/message',require('./room.route'))
module.exports = router