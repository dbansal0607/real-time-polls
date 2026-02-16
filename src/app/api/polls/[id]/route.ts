import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const poll = await db.poll.findUnique({
            where: { id },
            include: { options: true }
        });

        if (!poll) {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
        }

        return NextResponse.json(poll);
    } catch (error) {
        console.error('Error fetching poll:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
