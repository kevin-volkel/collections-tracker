import { NextResponse } from "next/server";
import { authenticate } from "@/app/api/util/authMiddleware";
import { NextRequest } from "next/server";
import { deleteCollection, getCollection, getPrivateCollection } from "@/services/collectionService";
import { getUserById } from "@/services/userService";

//* getSingleCollection
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try{
        const { id } = await params;
        //* Attempt to grab the collection
        let res = await getCollection(id);
        if(res.status == 200) {
            return NextResponse.json({collection: res.collection}, {status: 200});
        }

        //* If collection is private, authenticate and attempt again
        const {_id: userId} = authenticate(request);
        const user = await getUserById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        res = await getPrivateCollection(id, userId);
        return NextResponse.json({collection: res.collection}, {status: 200});

    } catch (err : any){
        return NextResponse.json({error: err.message}, {status: 401});
    }
}

export async function DELETE(request: NextRequest, { params } : { params: { id: string }}){
    try{
        const { id } = await params;
        let { _id : userId} = authenticate(request);
        const user = await getUserById(userId); 
        if (!user) {
            throw new Error("User not found");
        }

        let deletedCollection = await deleteCollection(id, userId, false);
        return NextResponse.json({deletedCollection}, {status: 202});

    } catch (err : any) {
        return NextResponse.json({error: err.message}, {status: 401});
    }
}