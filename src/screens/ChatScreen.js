import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import io from 'socket.io-client';

const ChatScreen = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const socket = io('http://10.0.2.2:3000'); // Kết nối tới server socket.io

    useEffect(() => {
        // Lắng nghe sự kiện 'connect' để kiểm tra kết nối
        socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        // Lắng nghe sự kiện 'chat message' từ server
        socket.on('chat message', (message) => {
            console.log('Received message:', message);
            setMessages((prevMessages) => [...prevMessages, message]);
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
            socket.disconnect();
        };
    }, []);

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
                socket.emit('chat message', data);
            })
            .catch(error => console.error('Error sending message:', error));
    };

    const sendMessage = () => {
        let message;
        if (inputText.trim() === '') {
            message = { id: Date.now().toString(), message: '👍', name: 'user' };
        } else {
            message = { id: Date.now().toString(), message: inputText, name: 'user' };
        }
        sendMessageToServer(message);
        setInputText('');
    };

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
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Nhập tin nhắn..."
                />
                {inputText.trim() ?
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={sendMessage}
                    >
                        <Text style={styles.sendButtonText}>Gửi
                        </Text>
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={sendMessage}>
                        <Text style={styles.sendButtonLike}>👍
                        </Text>
                    </TouchableOpacity>
                }

            </View>
        </View>
    );
};

export default ChatScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    chatContainer: {
        flex: 1,
        padding: 10,
    },
    messageContainer: {
        marginVertical: 5,
        padding: 10,
        borderRadius: 10,
        maxWidth: '80%',
    },
    userMessage: {
        backgroundColor: '#dcf8c6',
        alignSelf: 'flex-end',
    },
    otherMessage: {
        backgroundColor: '#fff',
        alignSelf: 'flex-start',
    },
    messageText: {
        fontSize: 16,
    },
    messageName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
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
        fontSize: 30,
    },
});