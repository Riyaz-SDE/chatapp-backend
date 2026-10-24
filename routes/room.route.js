/**
 * this file used for 1-1 message post retrival
 */

const { Op } = require('sequelize');
const messageSchema = require('../config/messageSchema');
const validate = require('../config/validate');
const { RoomMember, Room, User } = require('../models');
const { getIo } = require('../socket');
const { AppError } = require('./errorhalder');

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
const getMembership = (roomId, userId) => RoomMember.findOne({ where: { RoomId: roomId, UserId: userId } });
async function assertMember(roomId, userId) {
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
// validate input data - userId 
router.post('/dm',
    messageSchema,validate
    , async (req,res,next) => {
        try {
            // testing purpose // res.status(200).json({message : 'done'})
            
            // vaariable intialization
            const userId = req.userId
            const targetId = req.body.targetId

            /*1. validate same both are same id */
            if (userId === targetId) throw new AppError(400, 'Cannot start a chat with yourself')

            /*2. validation targetId exist */
            // if (targetId.length && (await User.count({ where: { id: targetId } })) !== targetId.length) {
            //     throw new AppError(400, 'One or more users do not exist');
            // }
            const target = await User.findByPk(targetId);
            if (!target) throw new AppError('User not found', 404);

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

            // this will send dm if room exist
            if(existing) {
               const result = await getById(userId,targetId)
                res.status(201).json(result)
            }

            // this will send create room and send
            // starts a transaction. Everything inside either all succeeds or all gets undone.
            const newRoom = await sequelize.transaction(async (t) => {
                const r = await Room.create({ isGroup: false, createdBy: userId }, { transaction: t });
                await RoomMember.bulkCreate(
                    [{ RoomId: r.id, UserId: userId }, { RoomId: r.id, UserId: targetId }],
                    { transaction: t });
                    return r;
            });

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