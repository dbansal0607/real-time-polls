import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { question, options } = body;

        // Validation
        if (!question || typeof question !== 'string' || !question.trim()) {
            return NextResponse.json({ error: 'Question is required' }, { status: 400 });
        }
        if (!Array.isArray(options) || options.length < 2) {
            return NextResponse.json({ error: 'At least 2 options are required' }, { status: 400 });
        }
        const validOptions = options.filter(o => typeof o === 'string' && o.trim() !== '');

        if (validOptions.length < 2) {
            return NextResponse.json({ error: 'At least 2 valid options are required' }, { status: 400 });
        }

        // Create Poll and Options in a single transaction using Prisma
        const poll = await db.poll.create({
            data: {
                question: question.trim(),
                options: {
                    create: validOptions.map(text => ({
                        text: text.trim()
                    }))
                }
            }
        });

        return NextResponse.json({ id: poll.id }, { status: 201 });

    } catch (error) {
        console.error('Failed to create poll:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
