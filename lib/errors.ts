export class UnauthorizedError extends Error {
    statusCode: number;
    constructor(message = "Unauthorized access") {
        super(message);
        this.name = "Unauthorized";
        this.statusCode = 401;
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

export class UserNotFoundError extends Error {
    statusCode: number;
    constructor(message = "User not found") {
        super(message);
        this.name = "UserNotFound";
        this.statusCode = 404;
        Object.setPrototypeOf(this, UserNotFoundError.prototype);
    }
}

export class CollectionNotFoundError extends Error {
    statusCode: number;
    constructor(message = "Collection not found") {
        super(message);
        this.name = "CollectionNotFound";
        this.statusCode = 404;
        Object.setPrototypeOf(this, CollectionNotFoundError.prototype);
    }
}

export class ItemNotFoundError extends Error {
    statusCode: number;
    constructor(message = "Item not found") {
        super(message);
        this.name = "ItemNotFound";
        this.statusCode = 404;
        Object.setPrototypeOf(this, ItemNotFoundError.prototype);
    }
}

export class CannotUpdateTagsError extends Error {
    statusCode: number;
    constructor(message = "Unable to update tags") {
        super(message);
        this.name = "CannotUpdateTagsError";
        this.statusCode = 401;
        Object.setPrototypeOf(this, CannotUpdateTagsError.prototype);
    }
}

export class TagsLengthError extends Error {
    statusCode: number;
    constructor(message = "Tags are not of equal length") {
        super(message);
        this.name = "TagsLengthError";
        this.statusCode = 401;
        Object.setPrototypeOf(this, TagsLengthError.prototype);
    }
}

export class MissingFieldsError extends Error {
    statusCode: number;
    constructor(missingFields : string[]) {
        const msg = missingFields.length == 0 ? "Missing Fields" : `Missing the following fields: ${missingFields.map( (field) => `${field} `)}` 
        super(msg)
        this.statusCode = 401;
        this.name = "MissingFieldsError"
        Object.setPrototypeOf(this, MissingFieldsError.prototype);
    }
}