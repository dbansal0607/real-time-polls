import { notFound } from 'next/navigation';
import db from '@/lib/db';
import PollController from '@/components/PollController';
import Link from 'next/link';

// Force dynamic rendering so we always fetch fresh data on initial load
export const dynamic = 'force-dynamic';

export default async function PollPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch directly from DB
    const poll = await db.poll.findUnique({
        where: { id },
        include: { options: true }
    });

    if (!poll) {
        notFound();
    }

    const options = poll.options;

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-950 to-gray-950 flex flex-col items-center justify-center p-4">
            <PollController poll={poll} initialOptions={options} />

            <div className="mt-10">
                <Link href="/" className="px-6 py-3 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition font-medium text-sm">
                    &larr; Create another poll
                </Link>
            </div>
        </div>
    );
}
