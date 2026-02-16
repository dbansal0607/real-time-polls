'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';

export default function Home() {
    const router = useRouter();
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const addOption = () => {
        setOptions([...options, '']);
    };

    const removeOption = (index: number) => {
        if (options.length <= 2) return;
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!question.trim()) {
            setError('Please enter a question');
            return;
        }
        const validOptions = options.filter(o => o.trim());
        if (validOptions.length < 2) {
            setError('Please provide at least 2 options');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/polls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: question.trim(),
                    options: validOptions
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            router.push(`/poll/${data.id}`);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-950 to-gray-950">
            <div className="max-w-xl w-full">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 mb-6 rounded-full bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                        <Sparkles size={24} />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                        <span className="gradient-text">Ask. Share.</span><br />
                        <span className="text-white">Watch it Happen.</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
                        No logins. No friction. Just create a poll and watch the votes roll in live.
                    </p>
                </div>

                <div className="glass-panel rounded-2xl p-8 shadow-2xl backdrop-blur-xl bg-gray-900/50 border border-gray-800">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center justify-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">The Big Question</label>
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="e.g. Does pineapple belong on pizza?"
                                className="w-full px-5 py-4 text-lg bg-gray-950/50 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none transition text-white placeholder-gray-600 shadow-inner"
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">Options</label>
                            {options.map((option, index) => (
                                <div key={index} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                        className="flex-1 px-5 py-3 bg-gray-950/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:outline-none transition text-white placeholder-gray-600"
                                        required
                                    />
                                    {options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(index)}
                                            className="px-4 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition border border-transparent hover:border-red-500/20"
                                        >
                                            &times;
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addOption}
                            className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-2 transition"
                        >
                            + Add Another Option
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Launch Poll'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
