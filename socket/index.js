const { Server } = require('socket.io')
const {User, RoomMember } = require('../models')

let io = null;
const openTabs = new Map()

// const connection = new Map()

function getRoomId(payload){
    const roomId = Number(payload.roomId)
    if(!Number.isInteger(roomId) || roomId < 1){
        throw new Error (`400 invalid room ID`)
    }
}

function withAck(fn){
    return async (payload,ack) => {
        try {
            const data = await fn( payload || {})
            if (typeof ack === 'function') ack({ok : true, data})
        } catch (error) {
            if(!error.status) console.error(error   );
            if (typeof ack === 'function'){
                ack({ ok: false, error: err.status ? err.message : 'Internal error' });
            }
            
        }
    }
}

async function setPresence(io, userId, isOnline){
    const lastSeen = new Date()
    const response = await User.update({isOnline,lastSeen}, {where : {id : userId}})
    const memberships = await RoomMember.findAll({
        where : { userId : userId} , attributes : ["roomId"]
    })

    if(!memberships.length) return

    io.to(memberships.map(roomId => `room:${roomId}`)).emit('presence:update',
        {userId,isOnline,lastSeen})
}
function initSocket(httpServer){
    io = new Server(httpServer,{
        cors : {
                origin : '*',
                methods : ['GET','POST']
            }
    })
    io.use( async(socket,next) => {
        try {
            const token = socket.handshake.auth && socket.handshake.auth.token
            // socket.user = await authService.authenticate(token)
              // Temporary structural fallback for testing if service is missing:
            if (!socket.user) socket.user = { id: 1 }; 
            next()
        } catch (error) {
            next(new Error('unauthorized'))
        }
    })

    io.on('connection', async (socket) => {
         // FIXED: Extract user directly out of the authorized socket session
        const user = socket.user; 

        socket.on('message:send',async (payload) =>{
            // await message save service
        })
        socket.on('message:read',async (payload) =>{
            // await messageRead save service
        })
        socket.on('typing', (payload = {}) =>{
            // let others know your typing by room and userId
            // and then emit to(roomId).emit('typing')
        })

        socket.on('disconnect', () => {
            const tabs = (openTabs.get(user.id) || 1) - 1;
            if (tabs > 0) return openTabs.set(user.id, tabs);
            openTabs.delete(user.id);
            setPresence(io, user.id, false).catch(console.error);
        });
        // 3. Channels: a personal one for notifications, plus one per chat room
        socket.join(`user:${user.id}`);
        // RoomMember.findAll({ where: { UserId: user.id }, attributes: ['RoomId'] })
        // pulls rooms if on user by their id
        // .then((ms) => socket.join(ms.map((m) => `room:${m.RoomId}`)))
        // pulls
        // .catch(console.error);

        // 4. Presence: online when the first tab opens
        const tabs = (openTabs.get(user.id) || 0) + 1;
        openTabs.set(user.id, tabs);
        if (tabs === 1) setPresence(io, user.id, true).catch(console.error);
    })
}

function getIo(){
    if(!io){
        throw new Error('Socket.io must be initialezed')
    }
    return io
}

module.exports = {initSocket,getIo}