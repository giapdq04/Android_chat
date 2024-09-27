import * as React from 'react';
import { View, Text, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from './src/screens/ChatScreen';
const Stack = createNativeStackNavigator();
import LottieView from "lottie-react-native";

function HomeScreen({ navigation }) {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Home Screen</Text>
            <LottieView
                source={require("./src/chat.json")}
                style={{ width: "60%", height: "40%" }}
                autoPlay
                loop
            />
            <Button title="Go to Chat" onPress={() => navigation.navigate('Chat')} />
        </View>
    );
}

function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Chat" component={ChatScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;