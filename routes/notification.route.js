const router = require('express').Router()
const controller = require('../controllers/notification.controller')

router.get('/',controller.list) // gives generic  list of notification
router.patch('/:id/read',controller.list) // reads particular notification
router.post('/:roomId/read',controller.list) // reads particular room notification
router.post('/read-all',controller.list) // reads all
router.get('/unread-count',controller.list) // get unread noti count
// router.post('/',controller.notifyMany)
// router.post('/',)

module.exports  = router