import axios from 'axios';
import {showAlert} from "./alert";

const stripe = Stripe('pk_test_1BZdSgjlzgnamBA1nmyWEVvY00e7hj6mmL');

export const bookTour = async tourId => {
    try {

        // Get checkout session
        const session = await axios.get(`http://localhost:8080/api/v1/bookings/checkout-session/${tourId}`);
        // Create checkout form + Charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (e) {
        console.log(e);
        showAlert('error', e);
    }
};