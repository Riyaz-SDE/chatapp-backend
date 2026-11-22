const logger = require("../config-code/logger");
const { Message, RoomMember, User } = require("../models");
const { AppError } = require("../routes/errorhalder");
const { getIo } = require("../socket");

async function assertMember(roomId, userId) {
    logger.info(`assert membership function initialized ${roomId} ${userId}`);
    const m = await RoomMember.findOne({ where: { roomId, userId } });

    if (!m) throw new AppError(403, 'You are not a member of this room');
    return m;
}

exports.messageSend = async (req, res, next) => {
    try {
        logger.info('/send-message');
        const { roomId, userId, text } = req.body;

        // 1. Validate required inputs
        if (!roomId || !userId) {
            throw new AppError(400, 'roomId and userId are required');
        }
        if (!text || typeof text !== 'string' || !text.trim()) {
            throw new AppError(400, 'Message text cannot be empty');
        }

        // 2. Verify sender belongs to the room
        await assertMember(roomId, userId);

        // 3. Save message (trimmed) and update sender's read receipt
        const message = await Message.create({
            roomId,
            senderId: userId,
            text: text.trim(),
        });

        await RoomMember.update(
            { lastMessageReadId: message.id },
            { where: { roomId, userId } }
        );

        // 4. Fetch sender details so the client UI can render name/avatar immediately
        const sender = await User.findByPk(userId, {
            attributes: ['id', 'name', 'avatarUrl'],
        });

        const payload = {
            ...message.toJSON(),
            sender: sender ? sender.toJSON() : { id: userId },
        };

        // 5. Emit to the exact prefixed room channel used by socketsJoin
        const io = getIo();
        if (io) {
            io.to(`room:${roomId}`).emit('message:new', payload);
        } else {
            logger.warn('Socket.IO instance not initialized; skipping real-time emit');
        }

        // 4. this will store roomMembers, roomId&groupDetails
        const [members, room] = await Promise.all([
            // this one return userId in particular room
            RoomMember.findAll({ where: { RoomId: roomId }, attributes: ['UserId'] }),
            // this one return roomId is group or not
            Room.findByPk(roomId, { attributes: ['id', 'isGroup'] }),
        ]);

        // preview text processing
        const preview = text.length > 100 ? `${text.slice(0, 100)}…` : text;
        // notification service
        await notificationService.notifyMany(members.map((m) => m.UserId), {
            type: 'message',
            actor: sender, 
            roomId,
            messageId: message.id,
            body: room.isGroup ? `${user.username}: ${preview}` : preview,
        });

        return res.status(201).json(payload);
    } catch (error) {
        logger.error(error);
        next(error);
    }
};