import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { upsertStreamUser } from "../lib/stream.js";

export async function signup(req, res) {
    const {email, password, fullName} = req.body;

    try {
        if(!email || !password || !fullName) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if(password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address" });
        }

        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({ message: "Email already exists, please use a different one"})
        }

        const idx = Math.floor(Math.random() * 100) + 1; //generate a number from 1-100
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            email,
            password, 
            fullName,
            profilePic: randomAvatar
        });

        // CREATE STREAM USER
        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || ""
            });
            console.log(`Stream User created for ${newUser.fullName}`);
        } catch(error) {
            console.error("Could not create Stream user:", error);
        }

        const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        });

        res.cookie("jwttoken", token), {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        }

        res.status(201).json({success:true, user:newUser});
    } catch(error) {
        console.log("Error in signup controller", error);
        res.status(500).json({ message: `Internal Server Error` })
    }
};

export async function login(req, res) {
    let {email, password} = req.body;

    try {
        if(!email || !password) {
            return res.status(400).json({ message: "Please enter your email and password" });
        }

        const user = await User.findOne({ email });
        if(!user) {
            return res.status(401).json({ message: "Could not find email with that password" });
        }

        const isPasswordCorrect = await user.matchPassword(password);
        if(!isPasswordCorrect) {
            return res.status(401).json({ message: "Could not find email with that password" });
        }

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"
        });
        
        res.cookie("jwttoken", token), {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production"
        }

        res.status(200).json({success:true, user: user});
    } catch(error) {
        console.log("Error in login controller", error);
        res.status(500).json({ message: `Internal Server Error` });
    }
};

export function logout(req, res) {
    try {
    res.clearCookie("jwttoken");
    res.status(200).json({success:true, message: "Logged out successfully"});
    } catch(error) {
        console.log("Error in logout controller", error);
        res.status(500).json({ message: `Internal Server Error` });
    }
};

export async function onboard(req, res) {
    try {
        const userId = req.user._id;

        const {fullName, bio, nativeLanguage, learningLanguage, location} = req.body;

        if(!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({
                message: "Please fill all fields",
                missingFields: [
                    !fullName && "fullName", 
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location"
                ].filter(Boolean)
            });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...req.body,
            isOnboarded: true
        }, {new: true});

        if(!updatedUser) {
            return res.status(404).json({message: "User not found updated"});
        }

        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePic || ""
            });

            console.log(`Stream user updated after onboard for ${updatedUser.fullName}`);
        } catch (error) {
            console.log("Error updating Stream user during onboarding:", error.message);
        }
        

        return res.status(200).json({success: true, user: updatedUser})
    } catch(error) {
        console.log("Error in onboard controller", error);
        res.status(500).json({ message: `Internal Server Error` });
    }
}