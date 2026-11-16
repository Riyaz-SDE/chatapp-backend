const logger = require("../config-code/logger")
const { Message, RoomMember } = require("../models")
const { AppError } = require("../routes/errorhalder")
const { getIo } = require("../socket")

exports.messageSend = async(req,res,next) => {
    try {
        logger.info('/send-message')
        const {roomId,userId,text} = req.body
        // id roomdId message

        await assertMember(roomId,userId)
        // validate
        // save message
        const message = await Message.create({roomId : roomId, senderId : userId, message : text})
        await RoomMember.update({lastMessageReadId : message.id},
            {where : {roomId : roomId, userId : userId}})

        const sender = {userId : userId,}
        getIo().to(roomId).emit('message:new',{...message.toJSON(),sender})
        res.status(201).json(message)
        // notfication
    } catch (error) {
        logger.error(error)
        next(error)
    }
}

async function assertMember(roomId, userId) {
    logger.info(`assert membership function initialized ${roomId} ${userId}`)
    const m = await RoomMember.findOne({ where: { roomId: roomId, userId: userId } });
    console.log(m);

    if (!m) throw new AppError(403, 'You are not a member of this room');
    return m;
}