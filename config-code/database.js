const { Sequelize } = require('sequelize')
const path = require('path')
const dotenv = require('dotenv')
const env = process.env.NODE_ENV || 'dev'
const {DB_NAME,DB_USERNAME,DB_PASSWORD} = process.env

const sequelize = new Sequelize(
    // "new_db_sep-07","postgres","1107",
    DB_NAME,DB_USERNAME,DB_PASSWORD,
    {
        host: "localhost",
        port: "5432",
        dialect :'postgres'
    }
)

module.exports = sequelize