import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "../../util/authMiddleware";
import { getCollection } from "@/services/collectionService";
import { getUserById } from "@/services/userService";
import { deleteItem, getItems, updateItem } from "@/services/itemService";
import { UserNotFoundError } from "@/lib/errors";

//* getItems
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
        //* Grab the items
        const items = await getItems(id, userId, auth);

        return NextResponse.json({items}, {status: 200});

    } catch (err : any){
        const status  = err.statusCode || 500;
        return NextResponse.json( {err: err.message}, {status});
    }
}

//* deleteItem
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    let userId;
    try{
        ({ _id: userId } = authenticate(request));
        const user = await getUserById(userId);
        if (!user) {
            throw new UserNotFoundError();
        }
    
        //* Attempt to delete the item
        let deletedItem = await deleteItem(id, userId, false)
        return NextResponse.json({deletedItem}, {status: 200});

    } catch (err : any){
        const status  = err.statusCode || 500;
        return NextResponse.json( {err: err.message}, {status});
    }
}

//* updateItem
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
            updatedContent[key] = value;
        }

        let newCollection = await updateItem(userId, id, updatedContent);

        return NextResponse.json( newCollection, {status: 200})

    } catch (err : any) {
        const status  = err.statusCode || 500;
        return NextResponse.json( {err: err.message}, {status});
    }
}