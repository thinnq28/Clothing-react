import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../client/Order/PaymentSuccess.css';
import axios from 'axios';
import { environment } from '../../../environment/environment';
import { toast } from 'react-toastify';

const PaymentCancel: React.FC = () => {
    const location = useLocation();

    // Lấy orderCode từ query string
    const searchParams = new URLSearchParams(location.search);
    const orderCode = searchParams.get('orderCode');

    useEffect(() => {
        if (orderCode) {
            axios.post(`${environment.apiBaseUrl}/client/order/unpaid/${orderCode}`)
                .then(() => {
                    toast.info(`Thanh toán chưa thành công cho đơn hàng: ${orderCode}`);
                })
                .catch((error) => {
                    console.error('Lỗi xác nhận thanh toán:', error);
                    toast.error('Lỗi xác nhận thanh toán:', error);
                });
        }
    }, [orderCode]);

    return (
        <div className="main-box">
            <h4 className="payment-titlte">
                Thanh toán không thành công!
                <br/>
                Đơnn hàng của bạn vẫn được tạo!
            </h4>
            <p>
                Nếu có bất kỳ câu hỏi nào, hãy gửi email tới{' '}
                <a href="mailto:support@payos.vn">support@payos.vn</a>
            </p>
            <Link to="/haiha" id="return-page-btn">
                Trở về trang chủ của bạn
            </Link>
        </div>
    );
};

export default PaymentCancel;
