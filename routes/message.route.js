const inputSchemaforMessage = require('../config-code/dmMessageSchema')
const logger = require('../config-code/logger')
const { Message, RoomMember } = require('../models')
const { getIo } = require('../socket')

const router = require('express').Router()

router.post('/send-message',inputSchemaforMessage, async(req,res,next) => {
    try {
        logger.info('/send-message')
        const {roomId,userId,message} = req.body
        // id roomdId message

        await assertMember(roomId,userId)
        // validate
        // save message
        const message = Message.create({roomId : roomId, senderId : userId, message : message})
        await RoomMember.update({lastMessageReadId : message.id}, {where : {roomId : roomId, userId : userId}})

        const sender = {userId : userId,}
        getIo.to(roomId).emit('message:new',{...message.toJSON(),sender})
        // notfication
    } catch (error) {
        
    }
})


async function assertMember(roomId, userId) {
    logger.info(`assert membership function initialized ${roomId} ${userId}`)
    const m = await RoomMember.findOne({ where: { roomId: roomId, userId: userId } });
    console.log(m);

    if (!m) throw new AppError(403, 'You are not a member of this room');
    return m;
}

module.exports = router