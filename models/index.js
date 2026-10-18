const {DataTypes, DATE} = require('sequelize')
const sequelize = require('../config/database')
const { text } = require('express')

const User = sequelize.define('User',{
    id : { type : DataTypes.INTEGER, primaryKey : true, autoIncrement : true},
    name : { type : DataTypes.STRING(30), allowNull : false, unique : true,validate : { len : [3,30]} },
    passwordHash : { type:DataTypes.STRING, allowNull:false, defaultValue:'' },
    email : {type : DataTypes.STRING, allowNull : false, defaultValue : ''},
    avatarUrl : {type : DataTypes.STRING, allowNull : false, defaultValue : ''}, 
    isOnline : {type : DataTypes.BOOLEAN, defaultValue : false},
    lastSeen : {type : DataTypes.DATE, defaultValue : DataTypes.NOW},
})

const Room = sequelize.define('Room',{
    id : { type : DataTypes.INTEGER, primaryKey : true, allowNull: false},
    name : { type : DataTypes.STRING, defaultValue : ''} ,// for group name
    isGroup : { type : DataTypes.BOOLEAN, defaultValue : false},
    // FK createdBy <- user.id
})
// one to many - user has many room
Room.belongsTo(User, { as : 'creator', foreignKey : 'createdBy'})

const RoomMember = sequelize.define('RoomMember',{
    role : { type: DataTypes.ENUM('member','admin'), defaultValue : 'member'},
    lastReadMessageId : {type : DataTypes.INTEGER, allowNull : true}
})
// many to many - user -> roomMember -> room
User.belongsToMany(Room, {through : RoomMember, as : 'rooms', foreignKey : 'userId', otherKey : 'roomId' })
Room.belongsToMany(User, {through : RoomMember, as : 'members', foreignKey : 'roomId', otherKey : 'userId'})

const Message = sequelize.define('Message',{
    id : { type : DataTypes.INTEGER, primaryKey : true, autoIncrement : true },
    text : {
        type : DataTypes.TEXT, allowNull : false, validate : { len : [1,2000]}
    },

})
// user -> message | one to many
User.hasMany(Message, {foreignKey : { name : 'senderId', allowNull : false}})
Message.belongsTo(User, { as : 'sender', foreignKey: { name: 'senderId', allowNull: false } })

// room -> message | one to many
Room.hasMany(Message, { foreignKey : { name : 'roomId', allowNull : false}, onDelete : 'CASCADE' })
Message.belongsTo(Room, {foreignKey : { name : 'roomId', allowNull : false}})

const Notification = sequelize.define('Notification', {
    id : { type : DataTypes.INTEGER, primaryKey : true, autoIncrement : true},
    type : {type : DataTypes.ENUM('message','room_invite','room_remove'), allowNull : false},
    body : {type : DataTypes.STRING(300), defaultValue:''},
    isRead : {type : DataTypes.BOOLEAN, defaultValue: false },
    readAt : { type : DataTypes.DATE, allowNull : true} 
})

Notification.belongsTo(User, {as : 'recipient', foreignKey : {name : 'userId', allowNull:false}, onDelete : 'CASCADE'})
Notification.belongsTo(User, {as : 'actor', foreignKey : 'actorId',  onDelete : 'SET NULL' })
Notification.belongsTo(Room, { as : 'room', foreignKey : { name : 'roomId'}, onDelete : 'CASCADE'})
Notification.belongsTo(Message, {as: 'message', foreignKey : 'messageId', onDelete : 'CASCADE' })

module.exports = {sequelize, User, Room, RoomMember, Message, Notification}