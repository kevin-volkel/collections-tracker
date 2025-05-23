import { NextResponse } from "next/server";
import { authenticate } from "@/app/api/util/authMiddleware";
import { NextRequest } from "next/server";
import { getCollection, getPrivateCollection } from "@/services/collectionService";

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
        res = await getPrivateCollection(id, userId);
        return NextResponse.json({collection: res.collection}, {status: 200});

    } catch (err : any){
        return NextResponse.json({error: err.message}, {status: 401});
    }
}