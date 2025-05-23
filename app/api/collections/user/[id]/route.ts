import { NextResponse } from "next/server";
import { authenticate } from "@/app/api/util/authMiddleware";
import { NextRequest } from "next/server";
import { getCollectionsByUser } from "@/services/collectionService";

//* getCollectionsByUser
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    let auth, userId;
    try{
        ({ _id: userId } = await authenticate(request));
        auth = true;
    } catch (err : any) {
        userId = null;
        auth = false;
    }

    try{
        const collections = await getCollectionsByUser(id, userId, auth);
        return NextResponse.json({collections}, {status: 200});

    } catch (err : any){
        return NextResponse.json({error: err.message}, {status: 401});
    }
}