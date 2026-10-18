const { Server } = require('socket.io')
const {User, RoomMember } = require('../models')

let io = null;
const connection = new Map()

const connection = new Map()

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
            if(!error.status) console.error(err);
            if (typeof ack === 'function'){
                ack({ ok: false, error: err.status ? err.message : 'Internal error' });
            }
            
        }
    }
}

function setPresence(io, userId, isOnline){
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
}

function getIo(){
    if(!io){
        throw new Error('Socket.io must be initialezed')
    }
    return io
}

module.exports = {initSocket,getIo}