const { Op } = require("sequelize");
const logger = require("../config-code/logger");
const { User, Room, sequelize, RoomMember } = require("../models");
const { AppError } = require("../routes/errorhalder");
const { getIo } = require("../socket");

// Query includes member
const memberInclude = {
    model: User,
    as: 'members',
    attributes: ['id', 'name', 'avatarUrl', 'isOnline', 'lastSeen'],
    through: { attributes: ['role'] },
};

// Convert into JSON and format it
function serialize(room, userId) {
    const r = room.toJSON();
    r.members = r.members.map(({ RoomMember: rm, ...m }) => ({ ...m, role: rm && rm.role }));
    const other = r.members.find((m) => m.id !== userId);
    r.displayName = r.isGroup ? r.name : (other && other.name) || 'Unknown';
    return r;
}

// Validate member is in room
async function assertMember(roomId, userId) {
    logger.info(`assert membership function initialized ${roomId} ${userId}`);
    const m = await RoomMember.findOne({ where: { roomId, userId } });

    if (!m) throw new AppError(403, 'You are not a member of this room');
    return m;
}

// Fetch and serialize room details
async function getById(roomId, userId) {
    await assertMember(roomId, userId);
    const room = await Room.findByPk(roomId, { include: [memberInclude] });
    if (!room) throw new AppError(404, 'Room not found');

    return serialize(room, userId);
}

// Helper to force both users into the socket room and notify them
function forceJoinAndNotify(roomData, userId, targetId) {
    const io = getIo();
    if (!io) {
        throw new Error('Socket.IO instance is not initialized');
    }

    const roomChannel = `room:${roomData.id}`;

    // Force all active sockets belonging to both users into the room channel
    io.in([`user:${userId}`, `user:${targetId}`]).socketsJoin(roomChannel);

    // Notify both users so their client UI updates automatically
    io.to(roomChannel).emit('room:join', {
        room: roomData,
        sender: userId,
        receiver: targetId,
    });
}

exports.createOrDm = async (req, res, next) => {
    try {
        logger.info('DM authenticated and entering business logic');

        // 1. Initialize and validate IDs
        const userId = req.body.userId;
        const targetId = req.body.targetId;
        logger.debug(`ids are ${userId} ${targetId}`);

        if (userId === targetId) {
            throw new AppError(400, 'Cannot start a chat with yourself');
        }

        // 2. Validate target user exists
        const target = await User.findByPk(targetId);
        if (!target) {
            throw new AppError(404, 'User not found');
        }
        logger.info('target id validation success');

        // 3. Check if a 1-to-1 room already exists between both users
        const rooms = await Room.findAll({
            where: { isGroup: false },
            include: [{
                model: User,
                as: 'members',
                attributes: ['id'],
                through: { attributes: [] },
                where: { id: { [Op.in]: [userId, targetId] } },
            }],
        });

        const existing = rooms.find((r) => r.members.length === 2);

        // 4. If room exists, force-join sockets and return 200
        if (existing) {
            logger.info(`room already exists: ${existing.id}`);
            const result = await getById(existing.id, userId);

            forceJoinAndNotify(result, userId, targetId);

            return res.status(200).json(result);
        }

        // 5. Otherwise, create room and add both members inside a transaction
        logger.info(`creating new DM room for ${userId} and ${targetId}`);
        const newRoom = await sequelize.transaction(async (t) => {
            const r = await Room.create(
                { isGroup: false, createdBy: userId },
                { transaction: t }
            );

            await RoomMember.bulkCreate(
                [
                    { roomId: r.id, userId: userId },
                    { roomId: r.id, userId: targetId },
                ],
                { transaction: t }
            );

            return r;
        });

        logger.info(`new room created: ${newRoom.id}`);

        // 6. Fetch formatted room, force-join sockets, and return 201
        const result = await getById(newRoom.id, userId);
        forceJoinAndNotify(result, userId, targetId);

        return res.status(201).json(result);
    } catch (error) {
        logger.error(error);
        next(error);
    }
};