const express = require('express')
const app = express()
const {Server} = require('socket.io')
const http = require('http')
const { randomUUID } = require('crypto')
const dotenv = require('dotenv')
const path = require('path')
// const { timeStamp } = require('console')

// 1. ENV varialbles setups ==========================
const env = process.env.NODE_ENV
const envPath = path.resolve(__dirname,`./env/.env.${env}`)
const result = dotenv.config({ path : envPath })
if(result.error){
    console.log('❌ Failed to load env from: ${envPath}');
} else {
    console.log('✅ Successfully loaded env from env/.env.${env}');
}
console.log(`🚀 Application starting with NODE_ENV: ${process.env.NODE_ENV}`);
// ENV varialbles setups ==========================
const sequelize = require('./config/database')



// APP Setup =======================================
const server = http.createServer(app)

const io = new Server(server, {
    cors : {
        origin : '*',
        methods : ['GET','POST']
    }
})
const PORT = 3000

// connection manager
// const connectioLib = new Map()
// in-memory db
const db = new Map()

function saveNotification(userId,{ type = 'GENERIC', title, body = null, data = null }){
    const notification = {
        id : randomUUID(),
        userId,
        type,
        title,
        body,
        data,
        createdAt: new Date().toISOString()
    }
    db.set(userId, [notification, ...db.get(userId) || []]) // newest first
    return notification
}

function pushNotification(userId,payload){
    const notification = saveNotification(userId,payload)
    io.join(`user:${userId}`).emit('notification:new',notification)
    return notification
}
// middleware 
io.use('connection',(socket) => {
    console.log(`socket is ${socket.id} user is ${socket.userId}`);
    io.join(`user:${socket.userId}`)
    socket.on('disconnect',() => {
        console.log('socket disconnected');
        
    })
    
})
// general connection
io.on('connection',(socket) => {
    console.log(`socket connected is ${socket.id}`)
    // rooms join
    const room_name =  `user:${socket.userId}`
    // for notification only
    socket.join(room_name)
    // msg sent event-1
    // disconnect event
    socket.on('disconnect',(data) => {
        console.log(`User Gets Disconnected : user-socket-id-${socket.id}`)
    })
})


const funct1 = (req,res,next) =>{
    console.log('api request received')
    const {username1,password } = process.env
    console.log(username1,password);
    
    console.log(`application running on env ${process.env.NODE_ENV}`);
    next()
 }
app.use(funct1)
app.use(express.json())
app.use('/api',require('./routes')) 

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

const dbscript = async () => {
    try {
        await sequelize.authenticate()
        console.log('Database connection established successfully.');
        await sequelize.sync();
        server.listen(PORT,()=>{
            console.log(`server is running at ${PORT}`)
        })
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

dbscript()