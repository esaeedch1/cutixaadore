'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import Image from 'next/image';

export function FloatingWidgets() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([
        { text: 'Hello! I am CutiXa Adore, your AI assistant. How can I help you today?', sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');

    const handleWhatsAppClick = () => {
        // WhatsApp number: +923143022022
        window.open('https://wa.me/923143022022', '_blank');
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        setMessages(prev => [...prev, { text: inputValue, sender: 'user' }]);
        setInputValue('');

        // Simulate AI response
        setTimeout(() => {
            setMessages(prev => [...prev, { text: 'Thank you for your message. Currently, I am a demo interface, but I will be fully functional soon!', sender: 'bot' }]);
        }, 1000);
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            zIndex: 9999,
            alignItems: 'flex-end'
        }}>
            {/* AI Chatbot Window */}
            {isChatOpen && (
                <div style={{
                    width: '320px',
                    height: '450px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <div style={{
                        background: 'var(--gold-shining)',
                        padding: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: '#000'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '35px',
                                height: '35px',
                                background: '#fff',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>
                                CA
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>CutiXa Adore</h3>
                                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>AI Assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsChatOpen(false)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#000' }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{
                        flex: 1,
                        padding: '15px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                padding: '10px 14px',
                                borderRadius: msg.sender === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                                backgroundColor: msg.sender === 'user' ? 'var(--gold-matte)' : 'rgba(255,255,255,0.05)',
                                color: msg.sender === 'user' ? '#fff' : 'var(--foreground)',
                                fontSize: '0.9rem',
                                border: msg.sender === 'user' ? 'none' : '1px solid var(--border)',
                            }}>
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSendMessage} style={{
                        display: 'flex',
                        padding: '10px',
                        borderTop: '1px solid var(--border)',
                        background: 'var(--surface)',
                        gap: '10px'
                    }}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type a message..."
                            style={{
                                flex: 1,
                                padding: '10px 15px',
                                borderRadius: '50px',
                                border: '1px solid var(--border)',
                                background: 'transparent',
                                color: 'var(--foreground)',
                                outline: 'none'
                            }}
                        />
                        <button type="submit" style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'var(--gold-matte)',
                            color: '#fff',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}>
                            <Send size={18} style={{ marginLeft: '-2px' }} />
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', gap: '15px' }}>
                {/* WhatsApp Button */}
                <button
                    onClick={handleWhatsAppClick}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: '#25D366',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s ease',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    title="Chat on WhatsApp"
                >
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 3.825.001 6.938 3.113 6.939 6.938-.001 3.825-3.114 6.938-6.939 6.938z" />
                    </svg>
                </button>

                {/* AI Chatbot Button */}
                <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--gold-matte)',
                        color: '#fff',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(197, 160, 89, 0.4)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s ease',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    title="Chat with CutiXa Adore"
                >
                    <MessageCircle size={32} />
                </button>
            </div>
        </div>
    );
}
