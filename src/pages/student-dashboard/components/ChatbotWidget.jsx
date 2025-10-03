import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages?.length === 0) {
      // Initialize with welcome message
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: `Hello! I'm KIET Assistant. I can help you with:\n\n• Bus schedules and routes\n• Live tracking information\n• Stop locations and timings\n• Feedback and complaints\n• General transportation queries\n\nHow can I assist you today?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, messages?.length]);

  const predefinedResponses = {
    'bus schedule': `Here are today's bus schedules:\n\n🚌 KIET-01: Every 15 mins (08:00-18:00)\n🚌 KIET-02: Every 30 mins (08:30-17:30)\n🚌 KIET-03: Every 20 mins (07:45-19:00)\n\nWould you like details for a specific route?`,
    'live tracking': `You can track buses in real-time using our Live Tracking feature. Click on "Live Tracking" in the quick actions or navigation menu to see all active buses on the map with their current locations and ETAs.`,'route information': `We have 4 main routes:\n\n📍 Route 1: Main Campus ↔ Hostel Block\n📍 Route 2: Campus ↔ Metro Station\n📍 Route 3: Hostel ↔ Sports Complex\n📍 Route 4: Campus ↔ City Center\n\nWhich route would you like to know more about?`,'feedback': `To submit feedback:\n\n1. Use the feedback form in your dashboard\n2. Call our transport office: +91-9876543210\n3. Email: transport@kiet.edu\n\nWe value your feedback and respond within 24 hours!`,
    'emergency': `For emergencies:\n\n🚨 Transport Office: +91-9876543210\n🚨 Security: +91-9876543211\n🚨 Campus Emergency: +91-9876543212\n\nFor non-emergency issues, please use the feedback system.`,'default': `I understand you're asking about bus services. Here are some common topics I can help with:\n\n• "bus schedule" - View today's timings\n• "live tracking" - Track buses in real-time\n• "route information" - Learn about routes\n• "feedback" - Submit complaints or suggestions\n• "emergency" - Emergency contact numbers\n\nPlease type one of these topics or ask your specific question!`
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage?.toLowerCase();
    
    if (message?.includes('schedule') || message?.includes('timing') || message?.includes('time')) {
      return predefinedResponses?.['bus schedule'];
    } else if (message?.includes('track') || message?.includes('live') || message?.includes('location')) {
      return predefinedResponses?.['live tracking'];
    } else if (message?.includes('route') || message?.includes('path') || message?.includes('direction')) {
      return predefinedResponses?.['route information'];
    } else if (message?.includes('feedback') || message?.includes('complaint') || message?.includes('issue')) {
      return predefinedResponses?.['feedback'];
    } else if (message?.includes('emergency') || message?.includes('help') || message?.includes('contact')) {
      return predefinedResponses?.['emergency'];
    } else if (message?.includes('hello') || message?.includes('hi') || message?.includes('hey')) {
      return `Hello! I'm here to help with your bus transportation needs. What would you like to know?`;
    } else if (message?.includes('thank') || message?.includes('thanks')) {
      return `You're welcome! Is there anything else I can help you with regarding bus services?`;
    } else {
      return predefinedResponses?.['default'];
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue?.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: getBotResponse(inputValue),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp?.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Chat Widget Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="default"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full shadow-modal bg-primary hover:bg-primary/90"
        >
          <Icon name={isOpen ? "X" : "MessageCircle"} size={24} />
        </Button>
      </div>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-card border border-border rounded-lg shadow-modal z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="Bot" size={16} className="text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">KIET Assistant</h3>
                <p className="text-xs text-success">Online</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <Icon name="X" size={16} />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages?.map((message) => (
              <div
                key={message?.id}
                className={`flex ${message?.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message?.type === 'user' ?'bg-primary text-primary-foreground' :'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message?.content}</p>
                  <p className={`text-xs mt-1 ${
                    message?.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {formatTime(message?.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e?.target?.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                variant="default"
                size="icon"
                onClick={handleSendMessage}
                disabled={!inputValue?.trim() || isTyping}
              >
                <Icon name="Send" size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;