import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAllUsers } from "@/services/userService";

export async function GET(request: NextRequest)  {
    try{
        const users = await getAllUsers();

        return NextResponse.json(users, {status: 200});
    } catch (err : any) {
        const status  = err.statusCode || 500;
        return NextResponse.json( {err: err.message}, {status});
    }
}