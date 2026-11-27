const messageSchema = require('../config-code/dmMessageSchema')
const logger = require('../config-code/logger')
const { Message, RoomMember } = require('../models')
const { getIo } = require('../socket')
const controller = require('../controllers/message.controller-v2')
const router = require('express').Router()

router.get('/:roomId/message',messageSchema, controller.messageSend) // message pagination
router.post('/:roomId/message',messageSchema, controller.messageSend) // send message
router.patch('/:roomId/message/read',messageSchema, controller.messageSend) // update message
router.get('/message/:messageId',messageSchema, controller.messageSend) // read message
router.delete('/message/:roomId',messageSchema, controller.messageSend) // delete message


async function assertMember(roomId, userId) {
    logger.info(`assert membership function initialized ${roomId} ${userId}`)
    const m = await RoomMember.findOne({ where: { roomId: roomId, userId: userId } });
    console.log(m);

    if (!m) throw new AppError(403, 'You are not a member of this room');
    return m;
}

module.exports = router