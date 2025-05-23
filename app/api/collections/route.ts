import { NextResponse } from "next/server";
import { authenticate } from "../util/authMiddleware";
import { NextRequest } from "next/server";
import { createCollection, getAllCollections } from "@/services/collectionService";

//* createCollection
export async function POST(request: NextRequest)  {
    try{
        const {_id : userId} = authenticate(request);
        
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
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newCollection = await createCollection({title, description, tags, isPublic, ownerId: userId});
        return NextResponse.json( {collection: newCollection}, {status: 200});
    } catch (error : any) {
        return NextResponse.json( {error: error.message}, {status: 401});
    }
}

//* getAllCollections
export async function GET() {
    try{
        const collections = await getAllCollections();
        return NextResponse.json(collections, {status: 200});
    } catch (err : any){
        return NextResponse.json({error: err.message}, {status: 401});
    }
}