import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnect.mjs"
import User from "@/models/User";

type CreateUserInput = {
    username: string;
    password: string;
    email: string;
}

export async function createUser ({username, password, email} : CreateUserInput) {
    await dbConnect();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    try{
        const user = await User.create({username, hashedPassword, email});
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