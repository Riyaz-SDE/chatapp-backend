const { Op, Model } = require("sequelize")
const { Notification, Room, User } = require("../models")
const service = require('../feature/notification/service')
const { getIo } = require("../socket")

exports.notifyMany =  async (req,res,next) => { 

    // const {recipientIds}
    // check user ids of user and validate 
    // save notfication on db
    // use socket for notification
    // return created notfication
    
}

exports.list = async (req,res) => {
    const data = req.query
    let {userId, unread, before, limit} = data
    // if(Number) 
    limit = 20
    const condintion = {userId}
    if(unread) condintion.isRead = unread
    if(before) condintion.id = { [Op.lt ] : before}
    
    const notification = await Notification.findAll({
        condintion,
       include : [
            {
                model : User,
                as : 'actor',
                attributes : ['id','name','avatarUrl']
            },
            {
                model : Room,
                as : 'room',
                attributes : ['id','name','isGroup']
            },
        ],
        order : [['id',"DESC"]],
        limit : Math.min(Math.max(limit,1),50)
    })

    res.status(201).json( notification)
}


exports.markRead = async(req,res) =>{
    const userId = req.user.id
    const roomId = req.params.id
    const n = await Notification.findOne({ where: { id, userId } });
    if (!n) throw new AppError(404, 'Notification not found');
    if (!n.isRead) {
        await n.update({ isRead: true, readAt: new Date() });
        const count = await Notification.count({ where: { userId, isRead: false } })
        getIo.to(userId).emit('notification:count',{ unread : count})
    }
    res.json(n)

}  