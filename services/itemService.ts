import dbConnect from "@/lib/dbConnect.mjs"
import Collection from "@/models/Collection";
import User from "@/models/User"
import Item from "@/models/Item"
import { CannotUpdateTagsError, CollectionNotFoundError, ItemNotFoundError, TagsLengthError, UnauthorizedError, UserNotFoundError } from "@/lib/errors";

type ItemType = {
    name: String,
    description: String,
    tags: [String],
    collectionId: String
}

export async function addItem({ name, description, tags, collectionId } : ItemType, userId : String) {
    await dbConnect();

    try{
        //* Check for a valid user
        const user = await User.findById(userId);
        if(!user) {
            throw new UserNotFoundError();
        }

        //* Grab the collection and ensure owners match
        const collection = await Collection.findById(collectionId);
        if(!collection) {
            throw new CollectionNotFoundError();
        };
        if(collection.ownerId != userId) {
            throw new UnauthorizedError();
        }

        //* Make sure the tags have the same length
        if(tags.length != collection.tags.length) {
            throw new TagsLengthError("Items must have the same number of tags as the collection")
        }

        //* Make the item
        const newItem = await Item.create({name, description, itemTags: tags, collectionId})
        await newItem.save();

        //* Add the itemId to the collection list
        collection.items.push(newItem._id);
        await collection.save();
        
        return newItem;

    } catch (err : any) {
        throw err;
    }
    
}

export async function getItems(collectionId : string, userId : string, isAuth : boolean) {
    await dbConnect();

    try{
        //* Find the collection with the items
        let collection = await Collection.findById(collectionId).populate("items");
        if(!collection) {
            throw new CollectionNotFoundError();
        }

        //* Check if the collection is private
        //* If private, ensure owner account is signed in
        if(!collection.isPublic && userId != collection.ownerId){
            throw new UnauthorizedError();
        }

        //* Authorized - return the items
        return collection.items;
         
    } catch (err : any) {
        throw err;
    }
}



export async function deleteItem(itemId : string, userId : string, collectionDelete : boolean ) {
    await dbConnect();

    try{
        let itemToDelete = await Item.findById(itemId);
        if(!itemToDelete) {
            throw new ItemNotFoundError();
        }
        let collection = await Collection.findById(itemToDelete.collectionId);
        if (!collection) {
            throw new CollectionNotFoundError("Collection Not Found: Invalid Collection Id")
        }
        if (collection.ownerId != userId) {
            throw new UnauthorizedError();
        }
        
        await Item.findByIdAndDelete(itemId);
        if (!collectionDelete) { //* If the collection is NOT being deleted, need to remove item from collection
            collection.items = collection.items.filter((id: string) => id != itemId);
            await collection.save();
        }

        return itemToDelete;
        
    } catch (err : any) {
        throw err;
    }
}

export async function updateItem(userId : string, itemId: string, newItem : Partial<ItemType>) {
    await dbConnect();

     try {
            let user = await User.findById(userId);
            if(!user) {
                throw new UserNotFoundError();
            }
    
            const itemToUpdate = await Item.findById(itemId);
            const collection = itemToUpdate.collectionId;

            if (!collection) {
                throw new CollectionNotFoundError();
            }
            if(collection.ownerId != userId) {
                throw new UnauthorizedError();
            }
    
            for (const key of Object.keys(newItem)) {
                if (key == "tags") {
                    throw new CannotUpdateTagsError("Cannot update tags through this route");
                } else if (key in itemToUpdate) {
                    (itemToUpdate as any)[key] = (newItem as any)[key];
                }
            }
    
            // Run validation before saving
            await itemToUpdate.validate();
    
            await itemToUpdate.save();
            return itemToUpdate;
    
        } catch (err : any) {
            throw err;
        }
}

export async function updateTags(itemId : string, newTags : [string]) {
    
}