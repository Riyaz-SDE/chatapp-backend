const express = require('express')
const app = express()
const {Server} = require('socket.io')
const http = require('http')
const { randomUUID } = require('crypto')
const dotenv = require('dotenv')
const path = require('path')
const { errHandler } = require('./routes/errorhalder')
// const { timeStamp } = require('console')

// 1. ENV varialbles setups ==========================
const env = process.env.NODE_ENV || 'development' // Fallback to 'development' if undefined
const envPath = path.resolve(__dirname,`./env/.env.${env}`)
const result = dotenv.config({ path : envPath })   
if(result.error){
    console.log(`❌ Failed to load env from: ${envPath}`);
} else {
    console.log(`✅ Successfully loaded env from env/.env.${env}`);
}
console.log(`🚀 Application starting with NODE_ENV: ${process.env.NODE_ENV}`);
// ENV varialbles setups ==========================

// const sequelize = require('./config/database')


const funct1 = (req,res,next) =>{
    console.log('api request received')
    const {username1,password,NODE_ENV } = process.env
    // console.log('running on environment',NODE_ENV);
    
    console.log(`application running on env ${process.env.NODE_ENV}`);
    next()
    // console.log('next function not working');
    
 }
app.use(funct1)
app.use(express.json())

app.use('/dev',require('./routes')) 
app.use(errHandler)

app.get('/api/health-check',(req,res) => {
    res.status(200).json({
        status : "Ok",
        message : "Server is Running Smoothly"
    })
})

app.get('api/notification',(req,res) =>{
    const id = req.header('x-user-id')
    if(!id) return res.status(400).json({ message: 'x-user-id header required' })
    res.json(db.get(userId) || [])
})

app.post('/api/notifications/send', (req, res) => {
  const { toUserId, type, title, body, data } = req.body
  if (!toUserId || !title) {
    return res.status(400).json({ message: 'toUserId and title are required' })
  }
  res.status(201).json(createNotification(String(toUserId), { type, title, body, data }))
})



module.exports = app