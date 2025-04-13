import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../client/Order/PaymentSuccess.css';
import axios from 'axios';
import { environment } from '../../../environment/environment';
import { toast } from 'react-toastify';

const PaymentCancelCashier: React.FC = () => {
    const location = useLocation();

    // Lấy orderCode từ query string
    const searchParams = new URLSearchParams(location.search);
    const orderCode = searchParams.get('orderCode');

    useEffect(() => {
        if (orderCode) {
            axios.post(`${environment.apiBaseUrl}/client/order/unpaid/${orderCode}`)
                .then(() => {
                    toast.info(`Payment failed for order: ${orderCode}`);
                })
                .catch((error) => {
                    console.error('Payment confirmation error:', error);
                    toast.error('Payment confirmation error:', error);
                });
        }
    }, [orderCode]);

    return (
        <div className="main-box">
            <h4 className="payment-titlte">
                Payment failed!
                <br/>
                <strong>But Your order is still created!</strong>
            </h4>
            <p>
                If you have any questions, please email {' '}
                <a href="mailto:support@payos.vn">support@payos.vn</a>
            </p>
            <Link to="/admin/cashier" id="return-page-btn">
                Return to your home page
            </Link>
        </div>
    );
};

export default PaymentCancelCashier;
