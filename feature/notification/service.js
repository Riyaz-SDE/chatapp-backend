const { getIo } = require("../../socket");


 async function notifyAll(recipientIds, { type, actor, roomId = null, messageId = null, body = '' }) 
 {
    const ids = [...new Set(recipientIds)].filter((id) => id !== actor.id);
    if (!ids.length) return [];

    const rows = await Notification.bulkCreate(
    ids.map((userId) => ({ userId, type, actorId: actor.id, roomId, messageId,
         body: body.slice(0, 300) }))
        );

    rows.forEach((n) => getIo.to(n.userId).emit('notification:new', { ...n.toJSON(), actor }));
    return rows;
    // const {recipientIds}
    // check user ids of user and validate 
    // save notfication on db
    // use socket for notification
    // return created notfication
}

module.exports = {notifyAll}