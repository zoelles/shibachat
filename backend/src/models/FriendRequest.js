import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
    {
        sendingUser: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User",
            required: true
        },
        receivingUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "denied"],
            default: "pending"
        }
    }, {timestamps: true}
);

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;