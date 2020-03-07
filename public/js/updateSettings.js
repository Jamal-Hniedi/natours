import {showAlert} from "./alert";
import axios from 'axios';

export const updateSettings = async (type, data) => {
    try {
        const url = type === 'data' ?
            '/api/v1/users/update' :
            '/api/v1/users/updatePassword';
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });
        if (res.data.status === 'success')
            showAlert('success', `${type} updated successfully`);
        return res.data.data.user;
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};