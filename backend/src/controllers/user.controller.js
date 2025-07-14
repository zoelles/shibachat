import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { upsertStreamUser } from "../lib/stream.js";

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [
                {_id: {$ne: currentUserId}},
                {_id: {$nin: currentUser.friends}},
                {isOnboarded: true}
            ]
        });

        res.status(200).json({ success: true, recommendedUsers});
    } catch (error) {
        console.error("Error in getRecommendedUsers controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user.id)
            .select("friends")
            .populate("friends", "fullName profilePic nativeLanguage learningLanguage bio");

        res.status(200).json({success: true, friends: user.friends});
    } catch (error) {
        console.error("Error in getMyFreinds controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function sendFriendRequest(req, res) {
    try {
        const sendingId = req.user.id;
        const {id: recipientId } = req.params;

        if(sendingId === recipientId) {
            return res.status(400).json({message: "You can't send a friend request to yourself."});
        }

        const recipient = await User.findById(recipientId);

        if(!recipient) {
            return res.status(404).json({message: "User not found"});
        }

        if(recipient.friends.includes(sendingId)) {
            return res.status(400).json({message: "You are already friends with the user!"})
        }

        const existingRequest = await FriendRequest.findOne({
            $or: [
                {sendingUser: sendingId, receivingUser: recipientId },
                {sendingUser: recipientId, receivingUser: sendingId}
            ]
        });

        if(existingRequest) {
            return res.status(400).json({message: "A friend request already exists between you and this user"});
        }

        const newFriendRequest = await FriendRequest.create( {
            sendingUser: sendingId,
            receivingUser: recipientId
        });

        res.status(201).json( {success: true, friendRequest: newFriendRequest});
    } catch(error) {
        console.error("Error in sendFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const {id: requestId } = req.params;

        const friendRequest = await FriendRequest.findById(requestId);

        if(!friendRequest) {
            return res.status(404).json({ message: "Friend request not found"});
        }

        if(friendRequest.receivingUser.toString() !== req.user.id) {
            return res.status(403).json({message: "You are not authorized to change this request"});
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        await User.findByIdAndUpdate(friendRequest.sendingUser, {
            $addToSet: { friends: friendRequest.receivingUser}
        });

        await User.findByIdAndUpdate(friendRequest.receivingUser, {
            $addToSet: { friends: friendRequest.sendingUser}
        });

        res.status(200).json( {success: true, friendRequest: friendRequest});
    } catch(error) {
        console.error("Error in acceptFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function denyFriendRequest(req, res) {
    try {
        const {id: requestId } = req.params;

        const friendRequest = await FriendRequest.findById(requestId);

        if(!friendRequest) {
            return res.status(404).json({ message: "Friend request not found"});
        }

        if(friendRequest.receivingUser.toString() !== req.user.id) {
            return res.status(403).json({message: "You are not authorized to change this request"});
        }

        friendRequest.status = "denied";
        await friendRequest.save();

        res.status(200).json( {success: true, friendRequest: friendRequest});
    } catch(error) {
        console.error("Error in denyFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getFriendRequests(req, res) {
    try {
        const incomingReqs = await FriendRequest.find({
            receivingUser: req.user.id,
            status: "pending"
        }).populate("sendingUser", "fullName profilePic nativeLanguage learningLanguage bio");

        const acceptedReqs = await FriendRequest.find({
            sendingUser: req.user.id,
            status: "accepted"
        }).populate("receivingUser", "fullName profilePic");

        res.status(200).json({ success: true, incomingReqs, acceptedReqs });
    } catch(error) {
        console.error("Error in getFriendRequests controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getOutgoingFriendRequests(req, res) {
    try {
        const outgoingReqs = await FriendRequest.find({
            sendingUser: req.user.id,
            status: "pending"
        }).populate("receivingUser", "fullName profilePic nativeLanguage learningLanguage bio");

        res.status(200).json({ success: true, outgoingReqs });
    } catch(error) {
        console.error("Error in getOutgoingFriendRequests controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
