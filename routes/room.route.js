/**
 * this file used for 1-1 message post retrival
 */

const { Op } = require('sequelize');
const messageSchema = require('../config-code/messageSchema');
const validate = require('../config-code/validate');
const { RoomMember, Room, User, sequelize } = require('../models');
const { getIo } = require('../socket');
const { AppError } = require('./errorhalder');
const logger = require('../config-code/logger');

const router = require('express').Router()

router.use((req,res,next)=>{
    console.log('authservice');
    next()
})

function serialize(room, userId) {
  const r = room.toJSON();
  r.members = r.members.map(({ RoomMember: rm, ...m }) => ({ ...m, role: rm && rm.role }));
  const other = r.members.find((m) => m.id !== userId);
  r.displayName = r.isGroup ? r.name : (other && other.username) || 'Unknown';
  return r;
}
const getMembership = (roomId, userId) => {
    RoomMember.findOne({ where: { RoomId: roomId, UserId: userId } });
}
async function assertMember(roomId, userId) {
    logger.info('assert membership function initialized')
  const m = await getMembership(roomId, userId);
  if (!m) throw new AppError(403, 'You are not a member of this room');
  return m;
}
async function getById(roomId, userId) {
  await assertMember(roomId, userId);
  const room = await Room.findByPk(roomId, { include: [memberInclude] });
  if (!room) throw new AppError(404, 'Room not found');
  return serialize(room, userId);
}

//  getMembership <- assertMember <- getById <-  
// validate input data - userId 
router.post('/dm',
    messageSchema,validate
    , async (req,res,next) => {
        try {
            logger.info('DM authenticalled and enter bussiness logic')
            // testing purpose // res.status(200).json({message : 'done'})
            
            // ID's vaariable intialization
            const userId = req.body.userId
            const targetId = req.body.targetId

            logger.debug(`ids are ${userId} ${targetId}`)
            // 1. validate same both are same id 
            if (userId === targetId) throw new AppError(400, 'Cannot start a chat with yourself')
                
            /*2. validation targetId exist */
            // this is only for multiple ids
            // if (targetId.length && (await User.count({ where: { id: targetId } })) !== targetId.length) {
            //     throw new AppError(400, 'One or more users do not exist');
            // }
            logger.debug(`target id exist validation`)
            const target = await User.findByPk(targetId);
            if (!target) throw new AppError('User not found', 404);
            logger.info(`target id exist validation succsess`)
            
            logger.debug(`rooms exist check`)
            // find rooms with both members
            const members = await Room.findAll({
                where : { isGroup : false}, // room id
                include : [{ // user id
                    model : User, as : 'members', attributes:['id'], through : { attributes : []},
                    where : { id : { [Op.in] : [ userId, targetId ] } },
                }]
            })
            // The query fetches every 1-to-1 room containing at least one of the two users
            /* find existing room*/
            const existing = members.find( e => e.members.length === 2)
            logger.debug(`is room exist ${existing}`)
            
            // this will send dm if room exist
            if(existing) {
                logger.debug(`getById func invoked`)
                const result = await getById(userId,targetId)
                res.status(201).json(result)
            }
            logger.debug(`room not exist ${existing}`)
            
            // this will send create room and send
            // starts a transaction. Everything inside either all succeeds or all gets undone.
            logger.debug(`new room create transaction invoked ${userId}`)
            const newRoom = await sequelize.transaction(async (t) => {
                const r = await Room.create({ isGroup: false, createdBy: userId }, { transaction: t });
                const result = r.toJSON()
                console.log(result,'=========');
                
                logger.debug(` $ {result}`)
                await RoomMember.bulkCreate(
                    [{ roomId: r.id, UserId: userId }, { roomId: r.id, UserId: targetId }],
                    { transaction: t });
                    return r;
            });
            logger.info(`new room created transaction created`)
            [userId, targetId].forEach((id) => getIo.joinRoom(id, newRoom.id));
            res.status(200).json(getById(newRoom.id, userId))
        } catch (error) {
            console.log(error);
            next(error)
        }
        // return room
        // send message
})

module.exports = router