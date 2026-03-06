
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {

            const response = await fetch("http://10.0.2.2:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {

                // Save JWT Token
                await AsyncStorage.setItem("token", data.access_token);

                Alert.alert("Success", "Login Successful 🌾");

                // Navigate to dashboard
                router.replace("/(tabs)/dashboard");

            } else {
                Alert.alert("Login Failed", data.message);
            }

        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Cannot connect to server");
        }
    };

    return (
        <View style={styles.container}>

            <Text style={styles.title}>AgroMed 🌾</Text>
            <Text style={styles.subtitle}>Farmer Login</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/register")}>
                <Text style={{ textAlign: "center", marginTop: 20, color: "#2e7d32" }}>
                    Don't have an account? Register
                </Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: "center",
        padding: 25,
        backgroundColor: "#f4f6f8"
    },

    title: {
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10
    },

    subtitle: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 40,
        color: "gray"
    },

    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 14,
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: "white"
    },

    button: {
        backgroundColor: "#2e7d32",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10
    },

    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold"
    }

});

export default Login;