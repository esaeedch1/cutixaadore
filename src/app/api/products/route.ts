import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// ─── GET: All Products (Shop & Dashboard) ─────────────────────────────────
export async function GET() {
    try {
        const db = getDb();
        const [rows] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
        return NextResponse.json(rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// ─── POST: Add New Product (Admin) ──────────────────────────────────────────
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { sku, name, description, regularPrice, stock, visibility, images } = body;

        const db = getDb();
        const [res]: any = await db.query(
            'INSERT INTO products (sku, name, description, regular_price, stock, visibility, images) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [sku, name, description, regularPrice, stock, visibility, images]
        );

        return NextResponse.json({ id: res.insertId, message: 'Product created successfully' });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
