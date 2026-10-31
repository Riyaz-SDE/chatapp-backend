    /**
     * this file used for 1-1 message post retrival
     */
const { Op } = require('sequelize');
const messageSchema = require('../config-code/roomJoinDmSchema');
const validate = require('../config-code/validate');
const { RoomMember, Room, User, sequelize } = require('../models');
const { getIo } = require('../socket');
const { AppError } = require('./errorhalder');
const logger = require('../config-code/logger');

const router = require('express').Router()
// Auth middleware - seperated

// query includes member 
const memberInclude = {
    model: User,
    as: 'members',
    attributes: ['id', 'name', 'avatarUrl', 'isOnline', 'lastSeen'],
    through: { attributes: ['role'] },
}

// convert into json and format it 
function serialize(room, userId) {
    const r = room.toJSON();
    r.members = r.members.map(({ RoomMember: rm, ...m }) => ({ ...m, role: rm && rm.role }));
    const other = r.members.find((m) => m.id !== userId);
    r.displayName = r.isGroup ? r.name : (other && other.name) || 'Unknown';
    return r;
}
// find member is in room
const getMembership = (roomId, userId) => {
    return RoomMember.findOne({ where: { roomId: roomId, userId: userId } });
}
// validate member is in or not
async function assertMember(roomId, userId) {
    logger.info(`assert membership function initialized ${roomId} ${userId}`)
    const m = await RoomMember.findOne({ where: { roomId: roomId, userId: userId } });
    console.log(m);

    if (!m) throw new AppError(403, 'You are not a member of this room');
    return m;
}

// 
async function getById(roomId, userId) {
    // this one throw error when something wrong
    await assertMember(roomId, userId);
    const room = await Room.findByPk(roomId, { include: [memberInclude] });
    if (!room) throw new AppError(404, 'Room not found');
    console.log(room);

return serialize(room, userId);
}

//  getMembership <- assertMember <- getById <-  
// validate input data - userId 
router.post('/dm',messageSchema,validate, 
    async (req,res,next) => {
        try {
            logger.info('DM authenticalled and enter bussiness logic')
            
            // Main two variable - ID's variable intialization
            const userId = req.body.userId
            const targetId = req.body.targetId
            logger.debug(`ids are ${userId} ${targetId}`)

            // 1. validate both are same id 
            if (userId === targetId) throw new AppError(400, 'Cannot start a chat with yourself')
                
            /*2. validation targetId exist */
            // this is only for multiple ids
            // if (targetId.length && (await User.count({ where: { id: targetId } })) !== targetId.length) {
            //     throw new AppError(400, 'One or more users do not exist');
            // }

            logger.debug(`target id exist validation`) // initialization
            const target = await User.findByPk(targetId);
            if (!target) throw new AppError('User not found', 404);
            logger.info(`target id exist validation succsess`) // completed
            
            logger.debug(`rooms exist check`) // initialization
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
                const result = await getById(existing.id,userId)
                return res.status(201).json(result) //complete 1
            }
            logger.debug(`room not exist ${existing}`)  // complete 2
            
            // this will send create room and send
            // starts a transaction. Everything inside either all succeeds or all gets undone.
            logger.debug(`new room create transaction invoked ${userId}`)

            const newRoom = await sequelize.transaction(async (t) => {
                const r = await Room.create({ isGroup: false, createdBy: userId }, { transaction: t });
                const result = r.toJSON()
                console.log(result,'=========');
                
                logger.debug(` $ {result}`)
                await RoomMember.bulkCreate(
                    [{ roomId: r.id, userId: userId }, { roomId: r.id, userId: targetId }],
                    { transaction: t });
                    return r;
            });
            console.log(newRoom);
            
            logger.info(`new room created transaction created`)
            console.log(newRoom.id);
            // [userId, targetId].forEach((id) => getIo.joinRoom(id, newRoom.id));
            [userId, targetId].forEach(
                (id) => getIo().in(`user:${id}`).socketsJoin(`room:${newRoom.id}` ) 
                    );
            const result = await getById(newRoom.id, userId);
            res.status(200).json(getById(result))
        } catch (error) {
            console.log(error);
            next(error)
        }
        // return room
        // send message
})

module.exports = router