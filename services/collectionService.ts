import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnect.mjs"
import Collection from "@/models/Collection";

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