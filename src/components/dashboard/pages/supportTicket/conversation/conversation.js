'use client';
import { useState } from 'react';
import Image from 'next/image';

// Images
import user from "@public/images/user/userProfile.png";

export default function ConversationSection() {
    const [messages, setMessages] = useState([
        { id: 1, from: 'support', text: 'Hello! How can I assist you today?', time: '10:00 AM' },
        { id: 2, from: 'user', text: 'I’m facing an issue with my order.', time: '10:02 AM' },
    ]);
    const [input, setInput] = useState('');
    const [showSupportDetails, setShowSupportDetails] = useState(false);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setMessages(prev => [
            ...prev,
            {
                id: Date.now(),
                from: 'user',
                text: input,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
        ]);
        setInput('');
    };

    return (
        <div className="bg-white rounded-[12px] p-4 md:p-6 grid grid-cols-1 lg:grid-cols-10 gap-6">
            <div className="col-span-12 lg:col-span-7 flex flex-col">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div className="flex items-center gap-4">
                        <Image
                            src={user}
                            alt="User"
                            width={48}
                            height={48}
                            className="rounded-full bg-[#F5F7FF]"
                        />
                        <div>
                            <h5 className="text-sm md:text-base font-semibold">John Doe</h5>
                            <p className="text-xs md:text-sm text-gray-500 font-medium">Ticket ID: #12345</p>
                        </div>
                    </div>
                    <span className="px-4 py-1 text-xs md:text-sm bg-green-100 text-green-700 rounded-full font-medium">Open</span>
                </div>
                <div className="lg:hidden mb-4">
                    <button
                        onClick={() => setShowSupportDetails(prev => !prev)}
                        className="text-sm text-blue-600 font-medium underline"
                    >
                        {showSupportDetails ? 'Hide Support Details' : 'Show Support Details'}
                    </button>
                </div>

                {showSupportDetails && (
                    <div className="lg:hidden bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
                        <h5 className="text-md font-semibold">Support Details</h5>
                        <div>
                            <p className="text-sm font-semibold mb-2">Subject:</p>
                            <p className="text-sm">Order Issue</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold mb-2">Description:</p>
                            <p className="text-sm">
                                I received the wrong product in my last order and would like to initiate a return.
                            </p>
                        </div>
                    </div>
                )}
                <div className="flex-1 space-y-4 overflow-y-auto min-h-[calc(100vh-330px)] max-h-[calc(100vh-330px)] pr-2">
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`p-3 rounded-lg max-w-xs text-sm ${
                                    msg.from === 'user'
                                        ? 'bg-blue-100 text-blue-900'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                <p>{msg.text}</p>
                                <span className="text-[10px] text-gray-500 block text-right mt-1">{msg.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSend} className="mt-4 flex gap-2 border-t pt-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                        placeholder="Type your message..."
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                    >
                        Send
                    </button>
                </form>
            </div>
            <div className="hidden lg:block col-span-3 bg-gray-50 rounded-lg p-7 space-y-3">
                <h5 className="text-md font-semibold">Support Details</h5>
                <div>
                    <p className="text-sm font-semibold mb-2">Subject:</p>
                    <p className="text-sm">Order Issue</p>
                </div>
                <div>
                    <p className="text-sm font-semibold mb-2">Description:</p>
                    <p className="text-sm">
                        I received the wrong product in my last order and would like to initiate a return.
                    </p>
                </div>
            </div>
        </div>
    );
}