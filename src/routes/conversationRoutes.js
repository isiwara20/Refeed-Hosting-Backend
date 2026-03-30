import express from "express";
import { auth } from "../middleware/auth.middleware.js";
import * as controller from "../controllers/conversationController.js";

const router = express.Router();

router.use(auth);

router.get("/users", controller.getCommunicationUsers);
router.post("/", controller.createOrGetConversation);
router.get("/", controller.getMyConversations);
router.get("/:id/messages", controller.getConversationMessages);
router.patch("/:id/read", controller.markConversationAsRead);
router.post("/:id/messages", controller.sendMessage);
router.patch("/:id/messages/:messageId", controller.updateMessage);
router.delete("/:id/messages/:messageId", controller.deleteMessage);

export default router;
