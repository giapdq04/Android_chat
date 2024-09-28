import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import io from 'socket.io-client';

const ChatScreen = () => {
    const [messages, setMessages] = useState([]); // Danh sách tin nhắn
    const [inputText, setInputText] = useState(''); // Nội dung tin nhắn gửi đi
    const [typingUser, setTypingUser] = useState(''); // người đang nhập tin nhắn
    const [socketId, setSocketId] = useState(''); // socketId của client
    const socket = useRef(null); // Biến tham chiếu socket.io
    const typingTimeoutRef = useRef(null); // Biến tham chiếu setTimeout

    // Kết nối tới server socket.io và lắng nghe sự kiện
    useEffect(() => {
        socket.current = io('http://10.0.2.2:3000'); // Kết nối tới server socket.io

        // Lắng nghe sự kiện 'connect' để kiểm tra kết nối
        socket.current.on('connect', () => {
            console.log('Connected to socket server');
            setSocketId(socket.current.id); // Lưu trữ socketId
        });

        // Lắng nghe sự kiện 'disconnect'
        socket.current.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        // Lắng nghe sự kiện 'reconnect'
        socket.current.on('reconnect', () => {
            console.log('Reconnected to socket server');
            setSocketId(socket.current.id); // Cập nhật socketId mới
        });

        // Lắng nghe sự kiện nhận tin nhắn 'chat message' từ server
        socket.current.on('chat message', (message) => {
            console.log('Received message:', message);
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // Lắng nghe sự kiện nhập bàn phím 'typing' từ server
        socket.current.on('typing', (data) => {
            setTypingUser(data.name);
            if (data.socketId !== socketId) {
                resetTypingTimeout();
            }
        });

        // Fetch các tin nhắn ban đầu từ server
        fetch('http://10.0.2.2:3000/api/messages')
            .then(response => response.json())
            .then(data => {
                setMessages(data);
                console.log('Messages fetched:', data);
            })
            .catch(error => console.error('Error fetching messages:', error));

        // Cleanup khi component unmount
        return () => {
            socket.current.disconnect();
        };
    }, []);

    // hiển thị sự kiện nhập trong 1 giây và reset lại
    const resetTypingTimeout = () => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            setTypingUser('');
        }, 1000); // Reset typing message sau 1 giây
    };

    // Gửi tin nhắn tới server
    const sendMessageToServer = (message) => {
        fetch('http://10.0.2.2:3000/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Message sent:', data);
                // Gửi tin nhắn qua socket.io
                socket.current.emit('chat message', data);
            })
            .catch(error => console.error('Error sending message:', error));
    };

    // Gửi tin nhắn
    const sendMessage = () => {
        let message;
        message = { id: Date.now().toString(), message: inputText, name: 'user' };
        sendMessageToServer(message);
        setInputText('');
    };

    // Xử lý sự kiện nhập tin nhắn
    const handleInputChange = (text) => {
        setInputText(text);
        socket.current.emit('typing', { name: 'user', socketId: socketId });
    };

    // Item tin nhắn
    const renderItem = ({ item }) => (
        <View style={[styles.messageContainer, item.name === 'user' ? styles.userMessage : styles.otherMessage]}>
            <Text style={styles.messageName}>{item.name}</Text>
            <Text style={styles.messageText}>{item.message}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                style={styles.chatContainer}
            />
            {typingUser ? <Text style={styles.typingText}>{typingUser} đang nhập...</Text> : null}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={handleInputChange}
                    placeholder="Nhập tin nhắn..."
                />
                {inputText.trim() ?
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={sendMessage}
                    >
                        <Text style={styles.sendButtonText}>Gửi</Text>
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={sendMessage}>
                        <Text style={styles.sendButtonLike}>👍</Text>
                    </TouchableOpacity>
                }
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    chatContainer: {
        flex: 1,
    },
    messageContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#dcf8c6',
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#f1f0f0',
    },
    messageName: {
        fontWeight: 'bold',
    },
    messageText: {
        marginTop: 5,
    },
    typingText: {
        maxWidth: '40%',
        fontStyle: 'italic',
        color: '#aaa',
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingHorizontal: 10,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#007bff',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    sendButtonLike: {
        fontSize: 24,
    },
});

export default ChatScreen;