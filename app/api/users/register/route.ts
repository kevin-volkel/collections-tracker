import { createUser } from "@/services/userService";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        let username, password, email;

        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            ({ username, password, email } = await request.json());
        } else if (contentType.includes("multipart/form-data")) {
            const form = await request.formData();
            username = form.get("username")?.toString();
            password = form.get("password")?.toString();
            email = form.get("email")?.toString();
        } else {
            return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
        }
        
        // Basic validation
        if (!username || !password || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        
        const user = await createUser({username, password, email})

        // For now, just return the received data (never return password in production)
        return NextResponse.json({
            message: "User created successfully",
            user: { username, email }
        }, { status: 201 });
    } catch (error : any) {
        if(error.message != "") {
            return NextResponse.json({error: error.message}, {status: 400})
        }
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}