const {DataTypes} = require('sequelize')
const sequelize = require('../config/database')

const User = sequelize.define("User",{
    id : { type : DataTypes.INTEGER, primaryKey : true, autoIncrement : true },
    username : {
        type : DataTypes.STRING(30),
        allowNull:false,
        unique : true,
        validate : { len : [3,30] },
        passwordHash : { type: DataTypes.STRING, allowNull : false}
    },
    email : {
        type : DataTypes.STRING,
        allowNull : false,
        defaultValue: ''
    },
      avatarUrl: { type: DataTypes.STRING, defaultValue: '' },
      isOnline: { type: DataTypes.BOOLEAN, defaultValue: false },
      lastSeen: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
})