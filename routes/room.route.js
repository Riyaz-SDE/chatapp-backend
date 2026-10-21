/**
 * this file used for 1-1 message post retrival
 */

const { Op } = require('sequelize');
const messageSchema = require('../config/messageSchema');
const validate = require('../config/validate');
const { RoomMember, Room, User } = require('../models');

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
// validate input data - userId 
router.post('/dm',
    messageSchema,validate
    , async (req,res) => {
        // res.status(200).json({message : 'done'})
        // check target id exist
        const userId = req.userId
        const targetId = req.body.targetId
        /*1. validate same both are same id */
        if (userId === targetId) throw new AppError(400, 'Cannot start a chat with yourself')
        /*2. validation targetId exist */
        if (targetId.length && (await User.count({ where: { id: targetId } })) !== targetId.length) {
            throw new AppError(400, 'One or more users do not exist');
        }
        // find rooms with both members
        const members = await Room.findAll({
            where : { isGroup : false}, // room id
            include : [{ // user id
                model : User, as : 'members', attributes:['id'], through : { attributes : []},
                where : { id : { [Op.in] : [ userId, targetId ] } },
            }]
        })
        /* find existing room*/
        const existing = members.find( e => e.members.length === 2)
        let roomId = ''
        const result = ''
        if(existing) {
            roomId = existing.id
            const checkMembership = await RoomMember.findOne({ where: { RoomId: roomId, UserId: userId } });
            if (!checkMembership) throw new AppError(403, 'You are not a member of this room');
            const room = await Room.findByPk(roomId, { include: [
                {model: User,
                as: 'members',
                attributes: ['id', 'username', 'avatarUrl', 'isOnline', 'lastSeen'],
                through: { attributes: ['role'] },}
            ] });
            if (!room) throw new AppError(404, 'Room not found');
            result = serialize(room,userId)
            res.status(201).json(result)
        }
        /* if exist send dm*/
        const room = await sequelize.transaction(async (t) => {
        const r = await Room.create({ isGroup: false, createdBy: actor.id }, { transaction: t });
        await RoomMember.bulkCreate([{ RoomId: r.id, UserId: actor.id }, { RoomId: r.id, UserId: otherId }], { transaction: t });
        res.status(201).json(r);
        });
        [actor.id, otherId].forEach((id) => realtime.joinRoom(id, room.id));
        res.status(201).json(getById(room.id, actor.id))
        // return room
        // send message
})

module.exports = router