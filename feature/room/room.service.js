const { RoomMember, Room } = require("../../models");

function serialize(room, userId) {
  const r = room.toJSON();
  r.members = r.members.map(({ RoomMember: rm, ...m }) => ({ ...m, role: rm && rm.role }));
  const other = r.members.find((m) => m.id !== userId);
  r.displayName = r.isGroup ? r.name : (other && other.username) || 'Unknown';
  return r;
}

async function getRooms(userId) {
    const memberships = await RoomMember.findAll({ where : { userId : userId }})

    if(memberships.length === 0) return []

    const lastRead = new Map(memberships.map((room) => {
        return [room.roomId, room.lastReadMessageId || 0]
    })) // { room id : lastRead }


    const rooms = await Room.findAll({
        where : { id : [...lastRead.keys()] },
        include : [{
            model: User,
        as: 'members',
        attributes: ['id', 'username', 'avatarUrl', 'isOnline', 'lastSeen'],
        through: { attributes: ['role'] },
        }]
    })  // Room  <--  RoomMembers (RoomId, UserId, role)  -->  User

    const items = await Promise.all(
        rooms.map( async (room) => {
            const [unreadCount,lastMessage] = await Promise.all([
                Message.count({
                    where : {
                        RoomId: room.id, 
                        senderId: { [Op.ne]: userId }, 
                        id: { [Op.gt]: lastRead.get(room.id) } }
                    }),
                    Message.findOne({ where: { RoomId: room.id }, order: [['id', 'DESC']] }),
            ])
            return { ...serialize(room, userId), unreadCount, lastMessage };
        })
    )

    const ts = (r) => new Date((r.lastMessage && r.lastMessage.createdAt) || r.createdAt).getTime();
    return items.sort((a, b) => ts(b) - ts(a));


    
}