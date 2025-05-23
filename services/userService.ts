import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnect.mjs"
import User from "@/models/User";
import { deleteCollection } from "./collectionService";

type UserType = {
    username: string;
    password: string;
    email: string;
}

export async function createUser ({username, password, email} : UserType) {
    await dbConnect();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    try{
        const user = await User.create({username, password: hashedPassword, email});
        user.save();
        return { username: user.username, email: user.email };

    } catch (error : any) {
        if(error.code === 11000) {
            if(error.keyPattern?.username) {
                throw new Error("username already exists");
            }
            if(error.keyPattern?.email){
                throw new Error("Email already exists")
            }
            throw new Error("Duplicate Field");
        }
        throw error
    }
    
}

export async function getUserByUsername (username : string) {
    await dbConnect();

    try{
        const user = await User.findOne({ username }).select("+password");
        return user;
    } catch (error : any) {
        throw error;
    }
}

export async function getUserById (userId : string) {
    await dbConnect();

    try{
        const user = await User.findById(userId);
        return user;
    } catch (error: any) {
        throw error;
    }
}

export async function updateUser (userId: string, newUser : Partial<UserType>) {
    await dbConnect();

    try {
        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
            throw new Error("User not found");
        }

        for (const key of Object.keys(newUser)) {
            if (key === "password") {
                userToUpdate.password = await bcrypt.hash(newUser.password as string, 10);
            } else if (key in userToUpdate) {
                (userToUpdate as any)[key] = (newUser as any)[key];
            }
        }

        // Run validation before saving
        await userToUpdate.validate();

        await userToUpdate.save();
        return userToUpdate;

    } catch (err : any) {
        throw err;
    }
}

export async function deleteUser (userId: string) {
    await dbConnect();

    try {
        const userToDelete = await User.findById(userId);
        for(let collection of userToDelete.collections) {
            console.log(collection);
            let deletedCollection = await deleteCollection(collection, userId, true);
            console.log(deletedCollection);
        }

        await User.findByIdAndDelete(userId);
        return userToDelete;
    } catch (err : any) {
        throw err;
    }
}

export async function getAllUsers() {
    await dbConnect();

    try{
        const users = await User.find({}, { email: 0, collections: 0 });
        return users;
    } catch (err: any) {
        throw err;
    }
}