import {login, logout} from './login';
import '@babel/polyfill';
import {displayMap} from './mapbox';
import {updateSettings} from "./updateSettings";
import {bookTour} from "./stripe";

const mapbox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateDataForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-password');
const nameSpan = document.getElementById('name-header');
const userPhoto = document.getElementById('photo-preview');
const userPhotoHeader = document.getElementById('photo-header');
const bookBtn = document.getElementById('book-tour');

if (mapbox) {
    const locations = JSON.parse(mapbox.dataset.locations);
    displayMap(locations);
}

if (loginForm)
    loginForm.addEventListener('submit', evt => {
        evt.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (updateDataForm)
    updateDataForm.addEventListener('submit', async evt => {
        evt.preventDefault();
        const form = new FormData();
        const img = document.getElementById('photo').files[0];
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', img);
        const user = await updateSettings('data', form);
        nameSpan.textContent = user.name.split(' ')[0];
        if (img) {
            userPhoto.src = `img/users/${img.name}`;
            userPhotoHeader.src = `img/users/${img.name}`;
        }
    });

if (updatePasswordForm)
    updatePasswordForm.addEventListener('submit', async evt => {
        evt.preventDefault();
        const saveBtn = document.querySelector('.btn--save-password');
        saveBtn.textContent = 'Updating...';
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings('password', {
            passwordCurrent,
            password,
            passwordConfirm
        });
        saveBtn.textContent = 'Save password';

    });
if (bookBtn)
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...';
        const {tourId} = e.target.dataset;
        bookTour(tourId);
    });