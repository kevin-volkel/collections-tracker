import { NextResponse } from "next/server";
import { authenticate } from "@/app/api/util/authMiddleware";
import { NextRequest } from "next/server";
import { deleteCollection, getCollection, getPrivateCollection, updateCollection } from "@/services/collectionService";
import { getUserById } from "@/services/userService";
import { UserNotFoundError } from "@/lib/errors";

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
            throw new UserNotFoundError();
        }
        res = await getPrivateCollection(id, userId);
        return NextResponse.json({collection: res.collection}, {status: 200});

    } catch (err : any){
        const status  = err.statusCode || 500;
        return NextResponse.json( {err: err.message}, {status});
    }
}

export async function DELETE(request: NextRequest, { params } : { params: { id: string }}){
    try{
        const { id } = await params;
        let { _id : userId} = authenticate(request);
        const user = await getUserById(userId); 
        if (!user) {
            throw new UserNotFoundError();
        }

        let deletedCollection = await deleteCollection(id, userId, false);
        return NextResponse.json({deletedCollection}, {status: 202});

    } catch (err : any) {
        const status  = err.statusCode || 500;
        return NextResponse.json( {err: err.message}, {status});
    }
}

export async function PUT(request : NextRequest, { params } : { params: { id: string }}) {
    try{
        const { id } = await params;
        const {_id : userId} = authenticate(request);
        const user = await getUserById(userId);
        if (!user) {
            throw new UserNotFoundError();
        }

        const formData = await request.formData();
        let entries = formData.entries()
        let updatedContent: Record<string, any> = {};

        for (const [key, value] of entries) {
            console.log(`${key}: ${value}`);
            updatedContent[key] = value;
        }

        let newCollection = await updateCollection(userId, id, updatedContent);

        return NextResponse.json( newCollection, {status: 200})

    } catch (err : any) {
        const status  = err.statusCode || 500;
        return NextResponse.json( {err: err.message}, {status});
    }
}