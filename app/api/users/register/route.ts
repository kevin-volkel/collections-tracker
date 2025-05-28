import { MissingFieldsError } from "@/lib/errors";
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
            const missingFields = [];
            if(!username) missingFields.push("Username");
            if(!password) missingFields.push("Password");
            if(!email) missingFields.push("Email");
            throw new MissingFieldsError(missingFields);
        }
        
        const user = await createUser({username, password, email})

        return NextResponse.json({
            message: "User created successfully",
            user: { username, email }
        }, { status: 201 });
    } catch (err : any) {
        const status  = err.statusCode || 500;
        return NextResponse.json( {err: err.message}, {status});
    }
}