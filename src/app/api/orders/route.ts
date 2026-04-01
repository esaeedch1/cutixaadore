import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();
        const [rows] = await db.query('SELECT * FROM orders ORDER BY date DESC');
        return NextResponse.json(rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { order_id, customer_name, customer_email, customer_phone, address, total_amount, payment_method, items } = body;

        const db = getDb();
        await db.query(
            'INSERT INTO orders (id, customer_name, customer_email, customer_phone, address, total_amount, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [order_id, customer_name, customer_email, customer_phone, address, total_amount, payment_method]
        );

        // Add items to order_items
        if (items && items.length > 0) {
            for (const item of items) {
                await db.query(
                    'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
                    [order_id, item.id, item.name, item.qty, item.price]
                );
            }
        }

        return NextResponse.json({ message: 'Order received successfully' });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
