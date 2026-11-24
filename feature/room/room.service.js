const { Op } = require("sequelize");
const { RoomMember, Room, User, Message } = require("../../models");

function serialize(room, userId) {
  const r = room.toJSON();
  r.members = r.members.map(({ RoomMember: rm, ...m }) => ({ ...m, role: rm && rm.role }));
  const other = r.members.find((m) => m.id !== userId);
  r.displayName = r.isGroup ? r.name : (other && other.name) || 'Unknown';
  return r;
}

async function getChatListByUserId(userId) {

    // brings rooms with out userId : data
    const memberships = await RoomMember.findAll({ where : { userId : userId }})

    // return [] when no rooms : condition
    if(memberships.length === 0) return []

    // lastReads of rooms message : formating into map like roomsId --> lastMsgId
    const lastRead = new Map(memberships.map((room) => {
        return [room.roomId, room.lastReadMessageId || 0]
    })) // { room id : lastRead }

    // find all rooms by roomId and user details
    const rooms = await Room.findAll({
        where : { id : [...lastRead.keys()] },
        include : [{
            model: User,
            as: 'members',
            attributes : ['id', 'name', 'avatarUrl', 'isOnline', 'lastSeen'],
            through: { attributes: ['role'] },
        }]
    })  // Room  <--  RoomMembers (RoomId, UserId, role)  -->  User

    const items = await Promise.all(
        rooms.map( async (room) => {
            // loop through rooms data and convert that into unread count and lastmessage
            const [unreadCount,lastMessage] = await Promise.all([
                Message.count({
                    where : {
                        roomId: room.id, 
                        senderId: { [Op.ne]: userId }, 
                        id: { [Op.gt]: lastRead.get(room.id) } }
                    }),
                    Message.findOne({ where: { roomId: room.id }, order: [['id', 'DESC']] }),
            ])
            return { ...serialize(room, userId), unreadCount, lastMessage };
        })
    )

    const ts = (r) => new Date((r.lastMessage && r.lastMessage.createdAt) || r.createdAt).getTime();
    return items.sort((a, b) => ts(b) - ts(a));


    
}
async function getRoomData(roomId) {
    // assermemeber
    // check roomId
    // get room data
    // process room data and tranform it
}
module.exports = {getChatListByUserId,getRoomData}