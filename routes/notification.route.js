const router = require('express').Router()
const controller = require('../controllers/notification.controller')

router.get('/',controller.list)
router.post('/',controller.notifyMany)
// router.post('/',)