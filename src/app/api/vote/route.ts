import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { pollId, optionId } = body;

        if (!pollId || !optionId) {
            return NextResponse.json({ error: 'Missing pollId or optionId' }, { status: 400 });
        }

        // Get IP address (fairness check 1)
        const forwardedFor = req.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

        // Check if poll exists
        const poll = await db.poll.findUnique({ where: { id: pollId } });
        if (!poll) {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
        }

        // Check availability of option
        const option = await db.option.findUnique({
            where: { id: optionId }
        });

        if (!option || option.pollId !== pollId) {
            return NextResponse.json({ error: 'Invalid option for this poll' }, { status: 400 });
        }

        // Fairness Mechanism 1: Server-side IP check
        const existingVote = await db.vote.findUnique({
            where: {
                pollId_voterIp: {
                    pollId,
                    voterIp: ip
                }
            }
        });

        if (existingVote) {
            return NextResponse.json({ error: 'You have already voted in this poll (IP check).' }, { status: 403 });
        }

        // Record Vote using Transaction
        // Prisma transaction to create vote and update count
        await db.$transaction([
            db.vote.create({
                data: {
                    pollId,
                    optionId,
                    voterIp: ip
                }
            }),
            db.option.update({
                where: { id: optionId },
                data: { voteCount: { increment: 1 } }
            })
        ]);

        // Fetch updated options for broadcast and response
        const updatedOptions = await db.option.findMany({
            where: { pollId },
            select: { id: true, voteCount: true }
        });

        // Trigger Socket.io event
        if ((global as any).io) {
            (global as any).io.to(pollId).emit('update', updatedOptions);
        }

        return NextResponse.json({ message: 'Vote recorded', updatedOptions });

    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'You have already voted (Constraint).' }, { status: 403 });
        }
        console.error('Error recording vote:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
