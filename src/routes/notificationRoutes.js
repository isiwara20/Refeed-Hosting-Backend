import express from "express";
import * as controller from "../controllers/notificationController.js";

const router = express.Router();

/* ========= Send ========= */

router.post("/send", controller.sendNotification);
router.post("/retry", controller.retryFailed);

/* ========= History ========= */

router.get("/", controller.getAllNotifications);
router.get("/user/:userId/unread-count", controller.getUnreadCount);
router.get("/user/:userId", controller.getUserNotifications);

/* ========= Read / Unread ========= */

// Important: declare literal route before parameterized route
router.patch("/read-all", controller.markAllAsRead);
router.patch("/:id/read", controller.markAsRead);

/* ========= Templates ========= */

router.post("/templates", controller.createTemplate);
router.get("/templates", controller.getTemplates);
router.put("/templates/:id", controller.updateTemplate);
router.delete("/templates/:id", controller.deleteTemplate);

/* ========= Preferences ========= */

router.post("/preferences", controller.upsertPreference);
router.get("/preferences/:userId", controller.getPreference);

export default router;
