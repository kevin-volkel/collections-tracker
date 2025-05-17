import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server';

export function authenticate(req : NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error("No token, auth denied");
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        return {_id: (decoded as any).userId}
    } catch {
        throw new Error("Token is not valid")
    }
}