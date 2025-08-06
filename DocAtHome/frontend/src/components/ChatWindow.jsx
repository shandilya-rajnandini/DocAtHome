import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

// Connect to the backend socket server
const socket = io.connect("http://localhost:5000");

const ChatWindow = ({ room, onClose }) => {
    const { user } = useAuth();
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);

    const sendMessage = async () => {
        if (currentMessage !== "") {
            const messageData = {
                room: room,
                author: user.name,
                message: currentMessage,
                time: new Date(Date.now()).toLocaleTimeString(),
            };
            await socket.emit("send_message", messageData);
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
        }
    };

    useEffect(() => {
        socket.emit("join_room", room);

        const messageHandler = (data) => {
            setMessageList((list) => [...list, data]);
        };
        socket.on("receive_message", messageHandler);

        // Cleanup function to leave room and remove listener
        return () => {
            socket.off("receive_message", messageHandler);
        };
    }, [room]);

    return (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-secondary-dark rounded-lg shadow-2xl flex flex-col z-50">
            {/* Header */}
            <div className="bg-gray-900 p-3 flex justify-between items-center rounded-t-lg">
                <p className="font-bold text-white">Live Chat</p>
                <button onClick={onClose} className="text-white font-bold">X</button>
            </div>
            {/* Message Body */}
            <div className="flex-grow p-4 overflow-y-auto">
                {messageList.map((msg, index) => (
                    <div key={index} className={`mb-3 flex ${msg.author === user.name ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-[70%] ${msg.author === user.name ? 'bg-accent-blue text-white' : 'bg-gray-700'}`}>
                            <p>{msg.message}</p>
                            <p className="text-xs mt-1 opacity-70">{msg.time} - {msg.author}</p>
                        </div>
                    </div>
                ))}
            </div>
            {/* Footer Input */}
            <div className="p-3 border-t border-gray-700 flex">
                <input type="text" value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => { e.key === "Enter" && sendMessage(); }}
                    placeholder="Hey..."
                    className="flex-grow p-2 bg-primary-dark rounded-l-md focus:outline-none"/>
                <button onClick={sendMessage} className="bg-accent-blue text-white px-4 rounded-r-md">Send</button>
            </div>
        </div>
    );
};

export default ChatWindow;