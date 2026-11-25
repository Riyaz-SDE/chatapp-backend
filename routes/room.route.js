    /**
     * this file used for 1-1 message post retrival
     */
const { Op } = require('sequelize');
const messageSchema = require('../config-code/roomJoinDmSchema');
const validate = require('../config-code/validate');
const { RoomMember, Room, User, sequelize } = require('../models');
const { getIo } = require('../socket');
const { AppError } = require('./errorhalder');
const logger = require('../config-code/logger');

const router = require('express').Router()
const controller = require('../controllers/room.controller-v2')

//  getMembership <- assertMember <- getById <-  
// validate input data - userId
router.get('/',controller.getlist) // it uses query with data userId
router.get('/:roomId',controller.getRoom)
router.post('/',messageSchema,validate,controller.createOrDm )

module.exports = router