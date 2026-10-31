const inputSchemaforMessage = require('../config-code/dmMessageSchema')

const router = require('express').Router()

router.post('/send-message',inputSchemaforMessage, async(req,res,next) => {
    try {
        const {roomId,userId,message} = req.body
        // id roomdId message

        await assertMember(roomId,userId)
        // validate
        // save message
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