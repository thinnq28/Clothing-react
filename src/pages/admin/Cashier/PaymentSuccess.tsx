import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../client/Order/PaymentSuccess.css';
import axios from 'axios';
import { environment } from '../../../environment/environment';

const PaymentSuccessCashier: React.FC = () => {
    const location = useLocation();

    // Lấy orderCode từ query string
    const searchParams = new URLSearchParams(location.search);
    const orderCode = searchParams.get('orderCode');

    useEffect(() => {
        if (orderCode) {
            axios.post(`${environment.apiBaseUrl}/client/order/paid/${orderCode}`)
                .then(() => {
                    console.log('Xác nhận thanh toán thành công cho đơn hàng:', orderCode);
                })
                .catch((error) => {
                    console.error('Lỗi xác nhận thanh toán:', error);
                });
        }
    }, [orderCode]);

    return (
        <div className="main-box">
            <h4 className="payment-titlte">
                Thanh toán thành công. Cảm ơn bạn đã sử dụng payOS!
            </h4>
            <p>
                Nếu có bất kỳ câu hỏi nào, hãy gửi email tới{' '}
                <a href="mailto:support@payos.vn">support@payos.vn</a>
            </p>
            <Link to="/admin/cashier" id="return-page-btn">
                Trở về trang chủ của bạn
            </Link>
        </div>
    );
};

export default PaymentSuccessCashier;
