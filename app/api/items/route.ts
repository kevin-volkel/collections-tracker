import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "../util/authMiddleware";
import { addItem } from "@/services/itemService";
import { MissingFieldsError } from "@/lib/errors";


export async function POST(request: NextRequest)  {
    try{
        const {_id : userId} = authenticate(request);
        
        let name, description, tags, collectionId;
    
        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            ({ name, description, tags, collectionId } = await request.json());
        } else if (contentType.includes("multipart/form-data")) {
            const form = await request.formData();
            name = form.get("name")?.toString();
            description = form.get("description")?.toString();
            collectionId = form.get("collectionId")?.toString();
            tags = form.get("tags")?.toString();
        } else {
            return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
        }
    
        // Basic Field Validation
        if(!name || !description || !collectionId) {
            const missingFields = [];
            if(!name) missingFields.push("Name");
            if(!description) missingFields.push("Description");
            if(!collectionId) missingFields.push("CollectionId")
            throw new MissingFieldsError(missingFields);
        }

        const newItem = await addItem({name, description, tags, collectionId}, userId);
        return NextResponse.json( {item: newItem}, {status: 200});
    } catch (error : any) {
        const status  = error.statusCode || 500;
        return NextResponse.json( {error: error.message}, {status});
    }
}