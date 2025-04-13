import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import useFetchWithAuth from '../../../fetch/FetchAdmin';
import 'react-toastify/dist/ReactToastify.css';

interface variantItem {
    skuId: string;
    variantName: string;
    quantity: number;
    price: number;

}

interface OrderItem {
    quantity: number;
    price: number;
    variant: variantItem;
}

interface OrderDetailResponse {
    id: number;
    fullName: string;
    phoneNumber: string;
    email: string;
    address: string;
    orderDate: string;
    status: string;
    paymentStatus: string;
    total_money: number;
    items: OrderItem[];
    totalVoucherPercentage: number;
    totalVoucherFixed: number;
}

const OrderDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fetchWithAuth = useFetchWithAuth();
    const [orderDetail, setOrderDetail] = useState<OrderDetailResponse | null>(null);

    useEffect(() => {
        getOrderDetail();
    }, []);

    const getOrderDetail = async () => {
        try {
            await fetchWithAuth(`/orders/${id}`)
                .then(result => {
                    if (result.status == "OK") {
                        console.log(result.data)
                        setOrderDetail(result.data);
                    }
                })

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch order detail');
        }
    };

    if (!orderDetail) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-3 text-gray-800">Order Detail #{orderDetail.id}</h1>
            <div className="card shadow mb-4 p-4">
                <h5>Customer Info</h5>
                <p><strong>Full Name:</strong> {orderDetail.fullName}</p>
                <p><strong>Phone:</strong> {orderDetail.phoneNumber}</p>
                <p><strong>Email:</strong> {orderDetail.email}</p>
                <p><strong>Address:</strong> {orderDetail.address}</p>
                <p><strong>Order Date:</strong> {orderDetail.orderDate}</p>
                <p><strong>Status:</strong> {orderDetail.status}</p>
                <p><strong>Payment Status:</strong> {orderDetail.paymentStatus}</p>

                <hr />

                <h5>Order Items</h5>
                <table className="table table-bordered table-sm">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Product</th>
                            <th>Variant</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderDetail.items.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.variant.skuId}</td>
                                <td>{item.variant.variantName}</td>
                                <td>{item.quantity}</td>
                                <td>{item.price}₫</td>
                                <td>{item.price * item.quantity}₫</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <hr/>

                <div className="text-end">
                    <strong>Voucher with percentage: {orderDetail.totalVoucherPercentage ? orderDetail.totalVoucherPercentage : 0 }%</strong> <br/>
                    <strong>Voucher with fixed: {orderDetail.totalVoucherFixed ? orderDetail.totalVoucherFixed : 0 }₫</strong> <br/> 
                    <strong>Total Amount: {orderDetail.total_money}₫</strong>
                </div>

                <div className="mt-3">
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/orders')}>
                        Back to List
                    </button>
                </div>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default OrderDetail;
