import dbConnect from "@/lib/dbConnect.mjs"
import Collection from "@/models/Collection";
import User from "@/models/User"
import Item from "@/models/Item"

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
            throw new Error("No user found")
        }

        //* Grab the collection and ensure owners match
        const collection = await Collection.findById(collectionId);
        if(!collection) {
            throw new Error("No collection found")
        };
        if(collection.ownerId != userId) {
            throw new Error("You do not have permission to add items to this collection");
        }

        //* Make sure the tags have the same length
        if(tags.length != collection.tags.length) {
            throw new Error("Tags must be the same length as the collection");
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
            throw new Error("No collection found")
        }

        //* Check if the collection is private
        //* If private, ensure owner account is signed in
        if(!collection.isPublic && userId != collection.ownerId){
            throw new Error("Unauthorized");
        }
        
        //* Authorized - return the items
        return collection.items;
         
    } catch (err : any) {
        throw err;
    }
}

export async function deleteItem(itemId : string, collectionId : string, userId : string) {

}

export async function updateTags(itemId : string, newTags : [string]) {
    
}