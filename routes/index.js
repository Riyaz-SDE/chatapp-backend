const route = require("express").Router();
const path = require('path')
const dotenv = require('dotenv')

const f1 = (req,res,next) =>{
    console.log(`test logger ${req.method} : ${req.url} `);
    next()
}
route.use(f1)
route.get('/demo/v1',(req,res) => {res.json({ok : true})})

route.use('/message',require('./room.route'))
module.exports = route