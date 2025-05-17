import { NextResponse } from "next/server";
import { authenticate } from "../util/authMiddleware";
import type { NextRequest } from "next/server";
import { getUserById } from "@/services/userService";

export async function GET(request: NextRequest)  {
    try{
        const {_id: userId} = authenticate(request);

        const user = await getUserById(userId);

        return NextResponse.json(user, {status: 200});
    } catch (err : any) {
        return NextResponse.json( {error: err.message}, {status: 401});
    }
}