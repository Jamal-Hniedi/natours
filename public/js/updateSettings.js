import {showAlert} from "./alert";
import axios from 'axios';

export const updateSettings = async (type, data) => {
    try {
        const url = type === 'data' ?
            'http://localhost:8080/api/v1/users/update' :
            'http://localhost:8080/api/v1/users/updatePassword';
        console.log(data);
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