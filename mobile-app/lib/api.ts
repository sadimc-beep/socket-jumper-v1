import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// iOS Simulator uses localhost
// Physical Device (iPhone/Android) uses LAN IP
export const BASE_URL = 'http://192.168.0.126:8000/api/v1';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export const setAuthToken = async (token: string) => {
    await SecureStore.setItemAsync('authToken', token);
};

export const getAuthToken = async () => {
    return await SecureStore.getItemAsync('authToken');
};

export const removeAuthToken = async () => {
    await SecureStore.deleteItemAsync('authToken');
}

export default api;
