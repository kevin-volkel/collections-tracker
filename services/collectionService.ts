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