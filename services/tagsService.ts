import dbConnect from "@/lib/dbConnect.mjs";
import { CollectionNotFoundError, ItemNotFoundError, TagsLengthError, UnauthorizedError, UserNotFoundError } from "@/lib/errors";
import Collection from "@/models/Collection";
import Item from "@/models/Item";
import User from "@/models/User";

export async function updateItemTags(userId : string, itemId : string, newTags : string[]) {
    await dbConnect();

    try{
        const user = await User.findById(userId);
        if(!user) {
            throw new UserNotFoundError();
        }

        const itemToUpdate = await Item.findById(itemId);
        if(!itemToUpdate) {
            throw new ItemNotFoundError();
        }
        console.log("Got to here!")

        const collection = await Collection.findById(itemToUpdate.collectionId);
        if(!collection){
            throw new CollectionNotFoundError();
        }

        if(collection.ownerId != userId) {
            throw new UnauthorizedError();
        }

        //* At this point, everything exists and user has permission to change tags
        let oldTags = itemToUpdate.itemTags;
        if(oldTags.length != newTags.length) {
            throw new TagsLengthError("To update item tags, be sure the new tags have the same length as the old tags"); 
        }

        itemToUpdate.itemTags = newTags;
        await itemToUpdate.validate();
        await itemToUpdate.save();

        return itemToUpdate;

    } catch (err : any){
        throw err;
    }
}

export async function updateCollectionTags(userId : string, collectionId: string, newTags: string[]) {
    await dbConnect();

    try{
        const user = await User.findById(userId);
        if(!user) {
            throw new UserNotFoundError();
        }

        const collection = await Collection.findById(collectionId);
        if(!collection) {
            throw new CollectionNotFoundError();
        }

        if(collection.ownerId != userId) {
            throw new UnauthorizedError();
        }

        if(collection.tags.length != newTags.length) {
            throw new TagsLengthError();
        }

        collection.tags = newTags;
        await collection.validate();
        await collection.save();

        return collection;

    } catch (err : any) {
        throw err;
    }
}

export async function addCollectionTag(userId : string, collectionId : string, newTag : string, defaultValue = "N/A"){
    await dbConnect();
    
    try{
        const user = await User.findById(userId);
        if(!user) {
            throw new UserNotFoundError();
        }

        const collection = await Collection.findById(collectionId).populate('items');
        if(!collection) {
            throw new CollectionNotFoundError();
        }

        if(collection.ownerId != userId) {
            throw new UnauthorizedError();
        }

        //* Collection exists, user has permissions
        
        // 1) Update the collection tags
        collection.tags.push(newTag);
        
        // 2) Ensure all items are valid
        for(let itemToUpdate of collection.items) {
            if(!itemToUpdate) {
                throw new ItemNotFoundError("An item within the collection was not found")
            }
        }

        // 3) Add an empty string tag for each item
        for(let itemToUpdate of collection.items) {
            itemToUpdate.itemTags.push(defaultValue);
            await itemToUpdate.validate();
            await itemToUpdate.save();
        }
        
        await collection.validate();
        await collection.save();

        return collection;
        
    } catch (err : any) {
        throw err;
    }
}

export async function removeCollectionTag(userId : string, collectionId : string, removedTagIndex : number){
    try{
        const user = await User.findById(userId);
        if(!user) {
            throw new UserNotFoundError();
        }

        const collection = await Collection.findById(collectionId).populate('items');;
        if(!collection) {
            throw new CollectionNotFoundError();
        }

        if(collection.ownerId != userId) {
            throw new UnauthorizedError();
        }

        //* Collection exists, user has permissions
        if (
            removedTagIndex < 0 ||
            removedTagIndex >= collection.tags.length
        ) {
            throw new TagsLengthError("Invalid tag index to remove");
        }

        collection.tags.splice(removedTagIndex, 1);

        // Ensure all items exist
        for (const item of collection.items) {
            if (!item) {
                throw new ItemNotFoundError("An item within the collection was not found");
            }
        }

        // Remove the corresponding tag from each item's itemTags array
        for (const item of collection.items) {
            if (item.itemTags && item.itemTags.length > removedTagIndex) {
                item.itemTags.splice(removedTagIndex, 1);
                await item.validate();
                await item.save();
            }
        }

        await collection.validate();
        await collection.save();

        return collection;
    } catch (err : any) {
        throw err;
    }
}