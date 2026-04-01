import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();
        const [rows] = await db.query('SELECT * FROM invoices ORDER BY date DESC');
        return NextResponse.json(rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, order_id, customer_name, customer_email, date, amount, status, payment_method } = body;

        const db = getDb();
        await db.query(
            'INSERT INTO invoices (id, order_id, customer_name, customer_email, date, amount, status, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, order_id, customer_name, customer_email, date, amount, status, payment_method]
        );

        return NextResponse.json({ message: 'Invoice created successfully' });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
