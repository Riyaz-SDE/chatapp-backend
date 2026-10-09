const {DataTypes, DATE} = require('sequelize')
const sequelize = require('../config/database')

const User = sequelize.define('User',{
    id : { type : DataTypes.INTEGER, primaryKey : true, autoIncrement : true},
    name : { type : DataTypes.STRING(30), allowNull : false, unique : true,validate : { len : [3,30]} },
    passwordHash : { type:DataTypes.STRING, allowNull:false, defaultValue:'' },
    email : {type : DataTypes.STRING, allowNull : false, defaultValue : ''},
    avatarUrl : {type : DataTypes.STRING, allowNull : false, defaultValue : ''}, 
    isOnline : {type : DataTypes.BOOLEAN, defaultValue : false},
    lastSeen : {type : DataTypes.DATE, defaultValue : DataTypes.NOW},
})