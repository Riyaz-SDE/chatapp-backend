const router = require('express').Router()
const controller = require('../controllers/notification.controller')

router.get('/notification',controller.list) // gives generic  list of notification
router.get('/notification/unread-count',controller.list) // get unread noti count
router.patch('/notification/:id/read',controller.list) // reads particular notification
router.post('/notification/read-all',controller.list) // reads all
router.post('/:roomId/read',controller.list) // reads particular room notification
// router.post('/',controller.notifyMany)
// router.post('/',)

module.exports  = router