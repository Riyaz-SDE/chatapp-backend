// this page combines both app and socket instance
const http = require('http')
const app = require('./index')
// const server = http.createServer(app)
const {Server} = require('socket.io')
const {sequelize, User} = require('./models')
const PORT = 3000


const dbscript = async () => {
    try {
        await sequelize.authenticate()
        console.log('Database connection established successfully.');
        await sequelize.sync();
        // await User.update({ isOnline: false }, { where: { isOnline: true } });
        const server = http.createServer(app)
        const io = new Server(server, {
            cors : {
                origin : '*',
                methods : ['GET','POST']
            }
        })
        server.listen(PORT,()=>{
            console.log(`server is running at ${PORT}`)
        })
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

dbscript()