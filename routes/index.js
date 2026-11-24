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


/** auth api */ // needs to be finished
router.use('/auth',require('../feature/auth/auth.route'))

/** room apis */  // almost done
router.use('/room',protected,require('./room.route'))

/** message api */  // almost done
router.use('/message',protected,require('./message.route'))

/** notification api */  // almost done
router.use('/notification',protected,require('./notification.route'))
module.exports = router