const router = require("express").Router();
const { auth } = require("../middleware/auth");
const { getNotifications, getUnreadCount, markRead, markAllRead } = require("../controllers/notificationController");

router.use(auth);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/:notificationId/read", markRead);
router.put("/mark-all-read", markAllRead);

module.exports = router;
