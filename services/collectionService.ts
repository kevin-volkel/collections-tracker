import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnect.mjs"
import Collection from "@/models/Collection";
import User from "@/models/User"
import { deleteItem } from "./itemService";
import { CollectionNotFoundError } from "@/lib/errors";

type CollectionType = {
    title: String,
    description: String,
    // items: [String], (will be added through the itemService)
    tags: [String],
    isPublic: Boolean,
    ownerId: String
}

export async function createCollection( {title, description, tags, isPublic, ownerId} : CollectionType) {
    await dbConnect();

    try{
        const newCollection = await Collection.create({title, description, tags, isPublic, ownerId});
        newCollection.save();

        //* Update the user's "collections" array
        const user = await User.findById(ownerId);
        user.collections.push(newCollection._id);
        user.save();

        return {title, description, tags, isPublic};
    } catch (error : any) {
        throw error;
    }
}

//TODO: Make this paginate the response, as to not return a massive array every time
export async function getAllCollections() {
    await dbConnect();

    try{
        const collections = Collection.find({isPublic: true});
        return collections;
    } catch (error : any) {
        throw error;
    }
}

export async function getCollection(collectionId : string) {
    await dbConnect();

    try {
        const collection = await Collection.findOne({_id: collectionId});
        if(!collection) {
            throw new CollectionNotFoundError();
        }
        if(!collection.isPublic) {
            return {status: 401, collection: {}};
        }
        return {status: 200, collection: collection};

    } catch (err : any){
        throw err;
    }
}

export async function getPrivateCollection(collectionId: string, userId: string) {
    await dbConnect();

    try{
        const collection = await Collection.findOne({_id: collectionId});
        if(collection.ownerId == userId) {
            return {status: 200, collection: collection};
        } 
        return {status: 401, collection: collection};
    } catch (err: any) {
        throw err;
    }
}

export async function getCollectionsByUser(userId: string, authUserId : string, isAuth : boolean){
    await dbConnect();

    try{
        let user = await User.findById(userId);
        if(!user) {
            throw new Error("User not found");
        }

        let collections;
        if (isAuth && userId == authUserId) {
            collections = await Collection.find({ ownerId: userId });
        } else {
            collections = await Collection.find({ ownerId: userId, isPublic: true });
        }

        return collections;

    } catch (err : any) {
        throw err
    }

}

export async function deleteCollection(collectionId: string, userId: string, userDelete : boolean) {
    await dbConnect();

    try{
        let collectionToDelete = await Collection.findById(collectionId);
        if(collectionToDelete.ownerId == userId) {
            for(let item of collectionToDelete.items) {
                await deleteItem(item, userId, true);
            }


            await Collection.deleteOne({_id: collectionId});
            if(!userDelete){
                //* Also remove the collection from the user array
                const user = await User.findById(userId);
                if(!user) {
                    throw new Error("Collection Deleted. User Not Found")
                }
                user.collections = user.collections.filter( (id : string) => id != collectionId);
                await user.save();
            }

            return collectionToDelete;
        } else {
            throw new Error("Unauthorized")
        }
    } catch (err : any) {
        throw err;
    }
}

export async function updateCollection (userId: string, collectionId: string, newCollection : Partial<CollectionType>) {
    await dbConnect();

    try {
        let user = await User.findById(userId);
        if(!user) {
            throw new Error("User not found");
        }


        const collectionToUpdate = await Collection.findById(collectionId);
        if (!collectionToUpdate) {
            throw new Error("Collection not found");
        }
        if(collectionToUpdate.ownerId != userId) {
            throw new Error("Unauthorized");
        }

        for (const key of Object.keys(newCollection)) {
            if (key == "tags") {
                console.error("Cannot change tags using this route");
            } else if (key in collectionToUpdate) {
                (collectionToUpdate as any)[key] = (newCollection as any)[key];
            }
        }

        // Run validation before saving
        await collectionToUpdate.validate();

        await collectionToUpdate.save();
        return collectionToUpdate;

    } catch (err : any) {
        throw err;
    }
}