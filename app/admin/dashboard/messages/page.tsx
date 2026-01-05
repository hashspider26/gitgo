"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, Calendar, MessageSquare, CheckCircle2, Circle, Reply, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    status: "UNREAD" | "READ" | "REPLIED";
    createdAt: string;
    updatedAt: string;
}

export default function MessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const url = selectedStatus === "all" 
                ? "/api/contact" 
                : `/api/contact?status=${selectedStatus}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch messages");
            const data = await response.json();
            setMessages(data.messages || []);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [selectedStatus]);

    const updateMessageStatus = async (id: string, status: "UNREAD" | "READ" | "REPLIED") => {
        try {
            const response = await fetch(`/api/contact/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!response.ok) throw new Error("Failed to update status");
            fetchMessages();
            if (selectedMessage?.id === id) {
                setSelectedMessage({ ...selectedMessage, status });
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const deleteMessage = async (id: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return;
        try {
            const response = await fetch(`/api/contact/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete message");
            fetchMessages();
            if (selectedMessage?.id === id) {
                setSelectedMessage(null);
            }
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    const unreadCount = messages.filter(m => m.status === "UNREAD").length;
    const readCount = messages.filter(m => m.status === "READ").length;
    const repliedCount = messages.filter(m => m.status === "REPLIED").length;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "UNREAD":
                return <Circle className="h-4 w-4 text-blue-500" />;
            case "READ":
                return <CheckCircle2 className="h-4 w-4 text-yellow-500" />;
            case "REPLIED":
                return <Reply className="h-4 w-4 text-green-500" />;
            default:
                return null;
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "UNREAD":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case "READ":
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "REPLIED":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            default:
                return "";
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Contact Messages</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            Manage messages from the contact us page
                        </p>
                    </div>
                    <Button
                        onClick={fetchMessages}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-black p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Unread</p>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{unreadCount}</p>
                            </div>
                            <Circle className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-black p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Read</p>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{readCount}</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-yellow-500" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-black p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Replied</p>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{repliedCount}</p>
                            </div>
                            <Reply className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 flex gap-2">
                    <Button
                        variant={selectedStatus === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedStatus("all")}
                    >
                        All
                    </Button>
                    <Button
                        variant={selectedStatus === "UNREAD" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedStatus("UNREAD")}
                    >
                        Unread
                    </Button>
                    <Button
                        variant={selectedStatus === "READ" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedStatus("READ")}
                    >
                        Read
                    </Button>
                    <Button
                        variant={selectedStatus === "REPLIED" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedStatus("REPLIED")}
                    >
                        Replied
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Messages List */}
                    <div className="lg:col-span-1 space-y-3">
                        {loading ? (
                            <div className="text-center py-8 text-zinc-500">Loading messages...</div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500">No messages found</div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    onClick={() => setSelectedMessage(message)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                        selectedMessage?.id === message.id
                                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                                            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-primary/50"
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(message.status)}
                                            <span className="font-semibold text-zinc-900 dark:text-white">
                                                {message.name}
                                            </span>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(message.status)}`}>
                                            {message.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 line-clamp-2">
                                        {message.subject}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                                        <div className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {message.email}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(message.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Message Detail */}
                    <div className="lg:col-span-2">
                        {selectedMessage ? (
                            <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                                            {selectedMessage.subject}
                                        </h2>
                                        <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                                            <div className="flex items-center gap-1">
                                                <Mail className="h-4 w-4" />
                                                {selectedMessage.email}
                                            </div>
                                            {selectedMessage.phone && (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-4 w-4" />
                                                    {selectedMessage.phone}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {formatDate(selectedMessage.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusBadgeColor(selectedMessage.status)}`}>
                                        {selectedMessage.status}
                                    </span>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">From:</h3>
                                    <p className="text-zinc-900 dark:text-white">{selectedMessage.name}</p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Message:</h3>
                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                        <p className="text-zinc-900 dark:text-white whitespace-pre-wrap">
                                            {selectedMessage.message}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                    {selectedMessage.status !== "READ" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => updateMessageStatus(selectedMessage.id, "READ")}
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Mark as Read
                                        </Button>
                                    )}
                                    {selectedMessage.status !== "REPLIED" && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => updateMessageStatus(selectedMessage.id, "REPLIED")}
                                        >
                                            <Reply className="h-4 w-4 mr-2" />
                                            Mark as Replied
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => deleteMessage(selectedMessage.id)}
                                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
                                <MessageSquare className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                                <p className="text-zinc-500 dark:text-zinc-400">Select a message to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

