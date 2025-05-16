import { getUserByUsername } from "@/services/userService";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";

export async function POST(request: Request)  {
    let username, password;
    const contentType = request.headers.get("content-type") || "";
    //* Get login information
    if (contentType.includes("application/json")) {
        ({ username, password } = await request.json());
    } else if (contentType.includes("multipart/form-data")) {
        const form = await request.formData();
        username = form.get("username")?.toString();
        password = form.get("password")?.toString();
    } else {
        return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
    }

    //* Basic Validation
    if (!username || !password) {
        return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    //* Search for matching user
    let user;
    try{
        user = await getUserByUsername(username);
        if(!user) {
            throw new Error()
        }
    } catch (error : any) {
        return NextResponse.json({ message: "Invalid credentials." }, {status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    // Generate a dummy auth token (replace with real token generation in production)
    const JWT_SECRET = process.env.JWT_SECRET || "this-is-a-secret-key-i-promise";

    const payload = {username: user.username, userId: user._id};
    const authToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "6h" });

    return NextResponse.json({ message: "Login successful.", authToken }, { status: 200 });
}