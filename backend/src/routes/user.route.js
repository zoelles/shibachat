import express from "express";
import { sendFriendRequest, getRecommendedUsers, getMyFriends, getFriendRequests, acceptFriendRequest, denyFriendRequest, getOutgoingFriendRequests } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.post("/friend-request/:id/accept", acceptFriendRequest);
router.post("/friend-request/:id/deny", denyFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendRequests);

export default router;