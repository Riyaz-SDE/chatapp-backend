const { Op, Model } = require("sequelize")
const { Notification, Room, User } = require("../models")


exports.notifyMany =  async (req,res,next) => { 
    // const {recipientIds}
    // check user ids of user and validate 
    // save notfication on db
    // use socket for notification
    // return created notfication
}

exports.list = async (req,res) => {
    const data = req.query
    const {userId, unread, before, limit} = data
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
                attributes : ['id','username','avatarUrl']
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
}