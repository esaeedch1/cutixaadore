import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();
        const [rows] = await db.query('SELECT * FROM users ORDER BY registered_at DESC');
        return NextResponse.json(rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, name, email, phone, provider, social_handle } = body;

        const db = getDb();
        await db.query(
            'INSERT INTO users (id, name, email, phone, provider, social_handle) VALUES (?, ?, ?, ?, ?, ?)',
            [id, name, email, phone, provider, social_handle]
        );

        return NextResponse.json({ message: 'User registered successfully' });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
