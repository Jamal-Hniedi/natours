import axios from 'axios';
import {hideAlert, showAlert} from './alert';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:8080/api/v1/users/login',
            data: {
                email,
                password
            }
        });
        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully!');
            location.assign('/');
        }
    } catch (err) {
        showAlert('error', 'FAILED successfully!');
    }
};

export const logout = async () => {
    showAlert('success', 'Logging out!');
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://localhost:8080/api/v1/users/logout'
        });
        if (res.data.status === 'success') {
            showAlert('success', 'Logged out successfully!');
            location.assign('/');
        }
    } catch (err) {
        showAlert('error', 'Cannot log out! Please try again!');
    }
};
