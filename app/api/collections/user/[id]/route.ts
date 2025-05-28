import { NextResponse } from "next/server";
import { authenticate } from "@/app/api/util/authMiddleware";
import { NextRequest } from "next/server";
import { getCollectionsByUser } from "@/services/collectionService";
import { getUserById } from "@/services/userService";
import { UserNotFoundError } from "@/lib/errors";

//* getCollectionsByUser
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    let auth, userId;
    try{
        ({ _id: userId } = authenticate(request));
        const user = await getUserById(userId);
        if (!user) {
            throw new UserNotFoundError();
        }
        auth = true;
    } catch (err : any) {
        userId = null;
        auth = false;
    }

    try{
        const collections = await getCollectionsByUser(id, userId, auth);
        return NextResponse.json({collections}, {status: 200});

    } catch (err : any){
        const status  = err.statusCode || 500;
        return NextResponse.json( {err: err.message}, {status});
    }
}