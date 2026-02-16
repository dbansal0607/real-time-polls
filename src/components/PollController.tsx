'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { CheckCircle, Share2, Loader2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import clsx from 'clsx';

type Poll = {
    id: string;
    question: string;
    createdAt: string;
};

type Option = {
    id: string;
    text: string;
    voteCount: number;
    pollId: string;
};

let socket: any;

export default function PollController({ poll, initialOptions }: { poll: Poll, initialOptions: Option[] }) {
    const [options, setOptions] = useState<Option[]>(initialOptions);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Initialize Socket.io
        socket = io();

        socket.on('connect', () => {
            console.log('Connected to socket server');
            setConnected(true);
            socket.emit('join-room', poll.id);
        });

        socket.on('disconnect', () => {
            setConnected(false);
        });

        socket.on('update', (updatedOptions: Option[]) => {
            setOptions(currentOptions => {
                return currentOptions.map(opt => {
                    const update = updatedOptions.find(u => u.id === opt.id);
                    return update ? { ...opt, voteCount: update.voteCount } : opt;
                });
            });
        });

        // Check local storage for vote status
        const voted = localStorage.getItem(`poll_voted_${poll.id}`);
        if (voted) {
            setHasVoted(true);
            setSelectedOption(voted);
        }

        return () => {
            if (socket) socket.disconnect();
        };
    }, [poll.id]);

    const handleVote = async () => {
        if (!selectedOption) return;
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pollId: poll.id, optionId: selectedOption }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to record vote');
            }

            // Success
            setHasVoted(true);
            localStorage.setItem(`poll_voted_${poll.id}`, selectedOption);

            // Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    const totalVotes = options.reduce((acc, curr) => acc + curr.voteCount, 0);

    return (
        <div className="max-w-2xl w-full mx-auto">
            <div className="glass-panel p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <h1 className="text-3xl font-extrabold text-white leading-tight pr-4">{poll.question}</h1>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${connected ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {connected ? 'Live' : 'Connect'}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
                        <AlertCircle size={20} />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <div className="space-y-4 mb-10">
                    {options.map((option) => {
                        const percentage = totalVotes === 0 ? 0 : Math.round((option.voteCount / totalVotes) * 100);

                        if (hasVoted) {
                            // Result View
                            return (
                                <div key={option.id} className="relative group">
                                    <div className="flex justify-between text-sm font-semibold text-gray-300 mb-2 z-10 relative px-1">
                                        <span>{option.text}</span>
                                        <span className={clsx(option.id === selectedOption ? "text-indigo-400" : "text-gray-400")}>
                                            {percentage}% ({option.voteCount})
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-xl h-14 overflow-hidden relative border border-gray-700">
                                        <div
                                            className={clsx(
                                                "h-full transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) flex items-center px-4",
                                                option.id === selectedOption
                                                    ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                                                    : "bg-gray-700"
                                            )}
                                            style={{ width: `${Math.max(percentage, 2)}%` }} // Min width for visibility
                                        />
                                    </div>
                                </div>
                            );
                        } else {
                            // Voting View
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => setSelectedOption(option.id)}
                                    className={clsx(
                                        "w-full text-left p-5 rounded-xl border-2 transition-all relative group",
                                        selectedOption === option.id
                                            ? "border-indigo-500 bg-indigo-500/10 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                                            : "border-gray-800 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-800 text-gray-300"
                                    )}
                                >
                                    <span className="font-semibold text-lg">{option.text}</span>
                                    {selectedOption === option.id && (
                                        <CheckCircle className="absolute right-5 top-1/2 -translate-y-1/2 text-indigo-400 drop-shadow-lg" size={24} />
                                    )}
                                </button>
                            );
                        }
                    })}
                </div>

                <div className="flex flex-col gap-6">
                    {!hasVoted ? (
                        <button
                            onClick={handleVote}
                            disabled={!selectedOption || loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Cast Vote'}
                        </button>
                    ) : (
                        <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-xl text-center backdrop-blur-md animate-in fade-in zoom-in duration-300">
                            <span className="text-green-400 font-bold text-lg block mb-1">Vote Cast Successfully.</span>
                            <span className="text-green-400/70 text-sm">Watching live results...</span>
                        </div>
                    )}

                    <button
                        onClick={copyLink}
                        className="group flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm hover:bg-white/5 py-2 px-4 rounded-lg transition-all"
                    >
                        <Share2 size={16} className="group-hover:text-indigo-400 transition-colors" />
                        <span>Copy Link</span>
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-500 font-mono">
                    TOTAL VOTES: {totalVotes}
                </div>
            </div>
        </div>
    );
}
