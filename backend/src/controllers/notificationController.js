const Notification = require("../models/Notification");

// ─── Get Notifications ──────────────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) { next(error); }
};

// ─── Get Unread Count ───────────────────────────────────
exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ recipientId: req.user.id, read: false });
    res.json({ unreadCount: count });
  } catch (error) { next(error); }
};

// ─── Mark as Read ───────────────────────────────────────
exports.markRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    res.json({ message: "Marked as read" });
  } catch (error) { next(error); }
};

// ─── Mark All as Read ───────────────────────────────────
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipientId: req.user.id, read: false }, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) { next(error); }
};
