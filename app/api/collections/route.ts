import { NextResponse } from "next/server";
import { authenticate } from "../util/authMiddleware";
import { NextRequest } from "next/server";
import { createCollection, getAllCollections } from "@/services/collectionService";
import { getUserById } from "@/services/userService";
import { MissingFieldsError, UserNotFoundError } from "@/lib/errors";

//* createCollection
export async function POST(request: NextRequest)  {
    try{
        const {_id : userId} = authenticate(request);
        const user = await getUserById(userId);
        if (!user) {
            throw new UserNotFoundError();
        }
        
        let title, description, isPublic, tags;
    
        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            ({ title, description, isPublic, tags } = await request.json());
        } else if (contentType.includes("multipart/form-data")) {
            const form = await request.formData();
            title = form.get("title")?.toString();
            description = form.get("description")?.toString();
            isPublic = form.get("isPublic")?.toString();
            tags = form.get("tags")?.toString();
        } else {
            return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
        }
    
        // Basic Field Validation
        if(!title || !description) {
            const missingFields = [];
            if(!title) missingFields.push("Title");
            if(!description) missingFields.push("Description");
            throw new MissingFieldsError(missingFields);
        }

        const newCollection = await createCollection({title, description, tags, isPublic, ownerId: userId});
        return NextResponse.json( {collection: newCollection}, {status: 200});
    } catch (err : any) {
        const status  = err.statusCode || 500;
        return NextResponse.json( {err: err.message}, {status});
    }
}

//* getAllCollections
export async function GET() {
    try{
        const collections = await getAllCollections();
        return NextResponse.json(collections, {status: 200});
    } catch (err : any){
        const status  = err.statusCode || 500;
        return NextResponse.json( {err: err.message}, {status});
    }
}