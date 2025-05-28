import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/app/api/util/authMiddleware';
import { getUserById } from '@/services/userService';
import { MissingFieldsError, UserNotFoundError } from '@/lib/errors';
import { getItems, deleteItem, updateItem } from '@/services/itemService';
import { addCollectionTag, removeCollectionTag, updateCollectionTags, updateItemTags } from '@/services/tagsService';

//* addCollectionTag
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    try{
        let { _id: userId } = authenticate(request);
        const user = await getUserById(userId);
        if (!user) {
            throw new UserNotFoundError();
        }

        const body = await request.json();
        const { newTag, defaultValue } = body;

        if (!newTag || !defaultValue) {
            const missingFields = [];
            if(!newTag) missingFields.push("NewTag");
            if(!defaultValue) missingFields.push("DefaultValue");
            throw new MissingFieldsError(missingFields);
        }
        
        let collection = await addCollectionTag(userId, id, newTag, defaultValue);


        return NextResponse.json({ collection }, { status: 200 });

    } catch (err : any){
        const status  = err.statusCode || 500;
        return NextResponse.json( {err: err.message}, {status});
    }
}

//* removeCollectionTag
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    let userId;
    try{
        ({ _id: userId } = authenticate(request));
        const user = await getUserById(userId);
        if (!user) {
            throw new UserNotFoundError();
        }

        const body = await request.json();
        const { removedTagIndex } = body;

        if (removedTagIndex === undefined) {
            throw new MissingFieldsError(["removedTagIndex"]);
        }
    
        //* Attempt to delete the item
        let collection = await removeCollectionTag(userId, id, removedTagIndex)
        return NextResponse.json({collection}, {status: 200});

    } catch (err : any){
        const status  = err.statusCode || 500;
        return NextResponse.json( {err: err.message}, {status});
    }
}

//* updateCollectionTag
export async function PUT(request : NextRequest, { params } : { params: { id: string }}) {
    try{
        const { id } = await params;
        const {_id : userId} = authenticate(request);
        const user = await getUserById(userId);
        if (!user) {
            throw new UserNotFoundError();
        }

        const body = await request.json();
        const { newTags } = body;

        if (!newTags) {
            throw new MissingFieldsError(["newTags"]);
        }

        let updatedCollection = await updateCollectionTags(userId, id, newTags);

        return NextResponse.json( updatedCollection, {status: 200})

    } catch (err : any) {
        const status  = err.statusCode || 500;
        return NextResponse.json( {err: err.message}, {status});
    }
}

//* updateItemTags
export async function PATCH(request : NextRequest, { params } : { params: { id: string }}) {
    try{
        const { id } = await params;
        const {_id : userId} = authenticate(request);
        const user = await getUserById(userId);
        if (!user) {
            throw new UserNotFoundError();
        }

        const body = await request.json();
        const { newTags } = body;

        if (!newTags) {
            throw new MissingFieldsError(["newTags"]);
        }

        let updatedItem = await updateItemTags(userId, id, newTags);

        return NextResponse.json( updatedItem, {status: 200})

    } catch (err : any) {
        const status  = err.statusCode || 500;
        return NextResponse.json( {err: err.message}, {status});
    }
}