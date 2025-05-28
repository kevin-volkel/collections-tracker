import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import * as collectionService from "../../services/collectionService";
import Collection from "@/models/Collection";
import User from "@/models/User";

// Mock dbConnect to avoid real DB connection
jest.mock("@/lib/dbConnect.mjs", () => jest.fn(() => Promise.resolve()));
jest.mock("@/models/Collection");
jest.mock("@/models/User");
jest.mock("@/services/itemService", () => ({
    deleteItem: jest.fn(() => Promise.resolve())
}));

describe("collectionService", () => {
    let userId: string;
    let collectionId: string;
    let user: any;
    let collection: any;

    beforeEach(() => {
        jest.clearAllMocks();
        userId = new mongoose.Types.ObjectId().toString();
        collectionId = new mongoose.Types.ObjectId().toString();
        user = {
            _id: userId,
            collections: [],
            save: jest.fn().mockResolvedValue(true)
        };
        collection = {
            _id: collectionId,
            title: "Test",
            description: "desc",
            tags: ["tag"],
            isPublic: true,
            ownerId: userId,
            items: [],
            save: jest.fn().mockResolvedValue(true),
            validate: jest.fn().mockResolvedValue(true)
        };
    });

    describe("createCollection", () => {
        it("should create a collection and update user", async () => {
            (Collection.create as any).mockResolvedValue(collection);
            (User.findById as any).mockResolvedValue(user);

            const result = await collectionService.createCollection({
                title: "Test",
                description: "desc",
                tags: ["tag"],
                isPublic: true,
                ownerId: userId
            });

            expect(Collection.create).toHaveBeenCalled();
            expect(user.save).toHaveBeenCalled();
            expect(result).toEqual({
                title: "Test",
                description: "desc",
                tags: ["tag"],
                isPublic: true
            });
        });
    });

    describe("getAllCollections", () => {
        it("should return all public collections", async () => {
            (Collection.find as any).mockReturnValue("collections");
            const result = await collectionService.getAllCollections();
            expect(result).toBe("collections");
            expect(Collection.find).toHaveBeenCalledWith({ isPublic: true });
        });
    });

    describe("getCollection", () => {
        it("should return collection if public", async () => {
            (Collection.findOne as any).mockResolvedValue(collection);
            const result = await collectionService.getCollection(collectionId);
            expect(result.status).toBe(200);
            expect(result.collection).toBe(collection);
        });

        it("should return 401 if collection is not public", async () => {
            (Collection.findOne as any).mockResolvedValue({ ...collection, isPublic: false });
            const result = await collectionService.getCollection(collectionId);
            expect(result.status).toBe(401);
        });

        it("should throw if collection not found", async () => {
            (Collection.findOne as any).mockResolvedValue(null);
            await expect(collectionService.getCollection(collectionId)).rejects.toThrow();
        });
    });

    describe("getPrivateCollection", () => {
        it("should return collection if owner", async () => {
            (Collection.findOne as any).mockResolvedValue(collection);
            const result = await collectionService.getPrivateCollection(collectionId, userId);
            expect(result.status).toBe(200);
            expect(result.collection).toBe(collection);
        });

        it("should return 401 if not owner", async () => {
            (Collection.findOne as any).mockResolvedValue({ ...collection, ownerId: "other" });
            const result = await collectionService.getPrivateCollection(collectionId, userId);
            expect(result.status).toBe(401);
        });
    });

    describe("getCollectionsByUser", () => {
        it("should return all collections if user is auth", async () => {
            (User.findById as any).mockResolvedValue(user);
            (Collection.find as any).mockResolvedValue([collection]);
            const result = await collectionService.getCollectionsByUser(userId, userId, true);
            expect(result).toEqual([collection]);
        });

        it("should return only public collections if not auth", async () => {
            (User.findById as any).mockResolvedValue(user);
            (Collection.find as any).mockResolvedValue([collection]);
            const result = await collectionService.getCollectionsByUser(userId, "other", false);
            expect(result).toEqual([collection]);
        });

        it("should throw if user not found", async () => {
            (User.findById as any).mockResolvedValue(null);
            await expect(collectionService.getCollectionsByUser(userId, userId, true)).rejects.toThrow("User not found");
        });
    });

    describe("deleteCollection", () => {
        it("should delete collection and update user", async () => {
            (Collection.findById as any).mockResolvedValue({ ...collection, items: [] });
            (Collection.deleteOne as any).mockResolvedValue({ deletedCount: 1 });
            (User.findById as any).mockResolvedValue(user);

            const result = await collectionService.deleteCollection(collectionId, userId, false);
            expect(Collection.deleteOne).toHaveBeenCalledWith({ _id: collectionId });
            expect(user.save).toHaveBeenCalled();
            expect(result._id).toBe(collectionId);
        });

        it("should throw if not owner", async () => {
            (Collection.findById as any).mockResolvedValue({ ...collection, ownerId: "other" });
            await expect(collectionService.deleteCollection(collectionId, userId, false)).rejects.toThrow("Unauthorized");
        });
    });

    describe("updateCollection", () => {
        it("should update collection fields except tags", async () => {
            (User.findById as any).mockResolvedValue(user);
            (Collection.findById as any).mockResolvedValue(collection);

            const result = await collectionService.updateCollection(userId, collectionId, { title: "New Title" });
            expect(collection.save).toHaveBeenCalled();
            expect(result.title).toBe("New Title");
        });

        it("should throw if user not found", async () => {
            (User.findById as any).mockResolvedValue(null);
            await expect(
                collectionService.updateCollection(userId, collectionId, { title: "New Title" })
            ).rejects.toThrow("User not found");
        });

        it("should throw if collection not found", async () => {
            (User.findById as any).mockResolvedValue(user);
            (Collection.findById as any).mockResolvedValue(null);
            await expect(
                collectionService.updateCollection(userId, collectionId, { title: "New Title" })
            ).rejects.toThrow("Collection not found");
        });

        it("should throw if not owner", async () => {
            (User.findById as any).mockResolvedValue(user);
            (Collection.findById as any).mockResolvedValue({ ...collection, ownerId: "other" });
            await expect(
                collectionService.updateCollection(userId, collectionId, { title: "New Title" })
            ).rejects.toThrow("Unauthorized");
        });
    });
});