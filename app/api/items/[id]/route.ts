import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "../../util/authMiddleware";
import { getCollection } from "@/services/collectionService";
import { getUserById } from "@/services/userService";
import { getItems } from "@/services/itemService";

//* getSingleCollection
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    let auth, userId;
    try{
        ({ _id: userId } = authenticate(request));
        const user = await getUserById(userId); // from userService
        if (!user) {
            throw new Error("User not found");
        }
        auth = true;
    } catch (err : any) {
        userId = null;
        auth = false;
    }
    
    try{
        //* Grab the items
        const items = await getItems(id, userId, auth);

        return NextResponse.json({items}, {status: 200});

    } catch (err : any){
        return NextResponse.json({error: err.message}, {status: 401});
    }
}