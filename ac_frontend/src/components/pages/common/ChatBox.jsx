import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Trash2 } from "lucide-react"; // Thêm icon Trash2
import { AnimatePresence } from "framer-motion";
import axios from "axios";
import ReactMarkdown from 'react-markdown';

const CHAT_STORAGE_KEY = "sanemi_chat_history";
const CHAT_TIME_KEY = "sanemi_chat_timestamp";
const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 giờ 

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);


  const loadInitialMessages = () => {
    const savedTime = localStorage.getItem(CHAT_TIME_KEY);
    const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);

    if (savedTime && savedMessages) {
      const currentTime = new Date().getTime();
      //  Lấy lại tin nhắn cũ
      if (currentTime - parseInt(savedTime) < EXPIRATION_TIME) {
        return JSON.parse(savedMessages);
      } else {
        //  Xóa dữ liệu cũ
        localStorage.removeItem(CHAT_STORAGE_KEY);
        localStorage.removeItem(CHAT_TIME_KEY);
      }
    }
    // Mặc định bắt đầu
    return [{ sender: "bot", text: "Dạ, rạp phim Sanemi xin chào quý khách! Mình có thể giúp gì cho bạn ạ? 🍿" }];
  };

  const [messages, setMessages] = useState(loadInitialMessages);

  //  LƯU TIN NHẮN VÀO LOCAL STORAGE 
  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    localStorage.setItem(CHAT_TIME_KEY, new Date().getTime().toString());
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  //  xóa lịch sử chat
  const handleClearChat = () => {
    const defaultMsg = [{ sender: "bot", text: "Dạ, rạp phim Sanemi xin chào quý khách! Mình có thể giúp gì cho bạn ạ? 🍿" }];
    setMessages(defaultMsg);
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(defaultMsg));
    localStorage.setItem(CHAT_TIME_KEY, new Date().getTime().toString());
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/chat",
        { message: userMessage },
        { headers: { "Content-Type": "application/json" } }
      );

      const botReply = response.data.result;
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
      
    } catch (error) {
      console.error("Lỗi khi gọi AI:", error);
      setMessages((prev) => [...prev, { 
        sender: "bot", 
        text: "Xin lỗi, hệ thống AI đang bận. Bạn vui lòng thử lại sau ít phút nhé! 🎬" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-body">
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-80 sm:w-[340px] bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[400px] max-h-[70vh] transition-all animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="bg-red-600 px-4 py-3 flex items-center justify-between shadow-md z-10">
              <div className="flex items-center gap-2 text-white">
                <Bot size={24} />
                <div>
                  <h3 className="font-bold text-sm">Sanemi Box</h3>
                  <p className="text-[10px] text-red-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleClearChat}
                  title="Xóa đoạn chat"
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  title="Đóng"
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Nội dung Chat */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-800/50 custom-scrollbar">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex items-end gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === "user" ? "bg-neutral-700 text-neutral-300" : "bg-red-600/20 text-red-500"
                  }`}>
                    {msg.sender === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  {/* Bong bóng tin nhắn */}
                  <div className={`max-w-[85%] px-4 py-2 text-sm rounded-2xl ${
                    msg.sender === "user" 
                      ? "bg-red-600 text-white rounded-br-sm" 
                      : "bg-neutral-700 text-white rounded-bl-sm"
                  }`}>
                    {msg.sender === "user" ? (
                      msg.text
                    ) : (
                      <div className="prose prose-invert prose-sm max-w-none 
                        [&>p]:mb-1 [&>p:last-child]:mb-0 
                        [&>ul]:pl-4 [&>ul]:list-disc [&>ul]:mb-1 
                        [&>ol]:pl-4 [&>ol]:list-decimal [&>ol]:mb-1
                        [&_strong]:text-red-400 [&_strong]:font-bold"
                      >
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-end gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-neutral-700 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Khung Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-neutral-900 border-t border-neutral-800">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Hỏi AI về rạp phim..."
                  disabled={isLoading}
                  className="w-full bg-neutral-800 border border-neutral-700 text-white text-sm rounded-full pl-4 pr-12 py-3 focus:border-red-500 outline-none transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </form>
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-600/30 hover:bg-red-700 transition-transform hover:scale-105 active:scale-95 relative"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-neutral-900 rounded-full"></span>
        )}
      </button>
    </div>
  );
};

export default ChatBox;