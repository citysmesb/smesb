import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'users.json');

const readUsers = () => {
    try {
        const fileData = fs.readFileSync(dataPath, 'utf-8');
        return JSON.parse(fileData);
    } catch (e) {
        return [];
    }
};

const writeUsers = (users: any[]) => {
    fs.writeFileSync(dataPath, JSON.stringify(users, null, 2), 'utf-8');
};

export async function GET() {
    return NextResponse.json(readUsers());
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const users = readUsers();
        
        // Simple check
        if (users.find((u: any) => u.email === body.email)) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }
        
        const newUser = {
            id: Date.now().toString(),
            name: body.name,
            email: body.email,
            password: body.password,
            role: body.role,
            permissions: body.permissions || []
        };
        
        users.push(newUser);
        writeUsers(users);
        
        return NextResponse.json(newUser, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const users = readUsers();
        
        const index = users.findIndex((u: any) => u.id === body.id);
        if (index === -1) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        // Only update provided fields
        users[index] = {
            ...users[index],
            name: body.name || users[index].name,
            email: body.email || users[index].email,
            role: body.role || users[index].role,
            permissions: body.permissions || users[index].permissions
        };
        
        // Update password if provided
        if (body.password) {
            users[index].password = body.password;
        }
        
        writeUsers(users);
        
        return NextResponse.json(users[index]);
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
        
        const users = readUsers();
        const filtered = users.filter((u: any) => u.id !== id);
        writeUsers(filtered);
        
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
