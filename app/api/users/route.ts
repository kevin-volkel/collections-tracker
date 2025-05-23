import { NextResponse } from "next/server";
import { authenticate } from "../util/authMiddleware";
import type { NextRequest } from "next/server";
import { deleteUser, getUserById, updateUser } from "@/services/userService";

export async function GET(request: NextRequest)  {
    try{
        const {_id: userId} = authenticate(request);

        const user = await getUserById(userId);
        if(!user) {
            throw new Error("User not found");
        }

        return NextResponse.json(user, {status: 200});
    } catch (err : any) {
        return NextResponse.json( {error: err.message}, {status: 401});
    }
}

export async function PUT(request : NextRequest) {
    try{
        const {_id : userId} = authenticate(request);
        const user = await getUserById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const formData = await request.formData();
        let entries = formData.entries()

        let updatedContent: Record<string, any> = {};

        for (const [key, value] of entries) {
            console.log(`${key}: ${value}`);
            updatedContent[key] = value;
        }

        let newUserInfo = await updateUser(userId, updatedContent);

        return NextResponse.json( newUserInfo, {status: 200})

    } catch (err : any) {
        return NextResponse.json( {error: err.message}, {status: 401});
    }
}

export async function DELETE(request : NextRequest) {
    try {
        const {_id: userId} = authenticate(request);
        const user = await getUserById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        await deleteUser(userId);
        return NextResponse.json( {deletedUser: user}, {status:200});
    } catch (err: any) {
        return NextResponse.json( {error: err.message}, {status: 401});
    }
}