import React, { useMemo, useState } from 'react';
import { API_BASE } from '../config/constants';
import Button from './ui/Button';
import Icon from './AppIcon';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      text: 'Hi! Ask about bus timings, driver details, bus members list, routes, or live tracking.'
    }
  ]);

  const quickQuestions = useMemo(() => ([
    'What are the bus timings?',
    'How do I see driver details?',
    'Where can I find the bus members list?',
    'How do I track my bus live?'
  ]), []);

  const appendMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const askQuestion = async (question) => {
    const trimmed = question.trim();
    if (!trimmed || isSending) return;

    appendMessage({ id: `user-${Date.now()}`, role: 'user', text: trimmed });
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch(`${API_BASE}/chatbot/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed })
      });

      const data = await response.json();
      const answer = data?.data?.answer || 'Sorry, I could not find an answer.';

      appendMessage({ id: `bot-${Date.now()}`, role: 'bot', text: answer });
    } catch (error) {
      appendMessage({
        id: `bot-${Date.now()}`,
        role: 'bot',
        text: 'Sorry, I could not reach the server. Please try again.'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    askQuestion(input);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="w-80 max-w-[85vw] rounded-2xl border border-muted bg-background shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-muted bg-muted/40">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-sm font-semibold">KIET Traveller Chatbot</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close chatbot"
            >
              <Icon name="X" size={16} />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-2xl px-3 py-2 text-sm max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 pb-3">
            <div className="flex flex-wrap gap-2 mb-3">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => askQuestion(question)}
                  className="text-xs rounded-full border border-muted px-3 py-1 hover:bg-muted"
                >
                  {question}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type your question..."
                className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isSending || !input.trim()}
                className="h-10"
              >
                {isSending ? '...' : 'Send'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90"
          aria-label="Open chatbot"
        >
          <Icon name="MessageCircle" size={20} />
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;
