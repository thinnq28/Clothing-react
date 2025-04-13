import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useFetchWithAuth from '../../../fetch/FetchAdmin';
import { useNavigate } from "react-router-dom";
import OrderService from '../../../services/OrderService';
import { IoIosInformationCircle } from 'react-icons/io';

interface OrderResponse {
    id: number;
    fullName: string;
    phoneNumber: string;
    email: string;
    orderDate: string;
    status: string;
    active: boolean;
    paymentStatus: string;
}

const OrderManagement: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [orderDate, setOrderDate] = useState('');
    const [status, setStatus] = useState('');
    const [isActive, setIsActive] = useState(true);

    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [visiblePages, setVisiblePages] = useState<number[]>([]);
    const fetchWithAuth = useFetchWithAuth();

    useEffect(() => {
        getOrders();
    }, [currentPage, itemsPerPage, fullName, phoneNumber, email, status, isActive, orderDate]);

    const getOrders = async () => {
        try {
            await fetchWithAuth('/orders', {
                params: {
                    fullName,
                    phoneNumber,
                    email,
                    orderDate,
                    status,
                    active: isActive,
                    page: currentPage,
                    limit: itemsPerPage
                }
            }).then(result => {
                const data = result.data;
                setOrders(data.orders);
                setTotalPages(data.totalPages);
                setVisiblePages(generateVisiblePageArray(currentPage, data.totalPages));
            })

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error fetching orders');
        }
    };

    const generateVisiblePageArray = (current: number, total: number): number[] => {
        const maxVisible = 5;
        const half = Math.floor(maxVisible / 2);
        let start = Math.max(current - half, 0);
        let end = Math.min(start + maxVisible, total);
        if (end - start < maxVisible) {
            start = Math.max(end - maxVisible, 0);
        }
        return Array.from({ length: end - start }, (_, i) => start + i);
    };

    const handleStatusUpdate = async (orderId: number, newStatus: string) => {
        try {
            const orderData = {
                status: newStatus
            }
            await OrderService.updateStatus(orderId, orderData)
            .then(result => {
                if(result.status != "OK") {
                    toast.error(result.message);
                }else{
                    toast.success(result.message);
                    getOrders(); // refresh list
                }
            })
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const handleUpdatePaymentStatus = async (orderId: number, newStatus: string) => {
        try {
            const orderData = {
                status: newStatus
            }
            await OrderService.updateStatus(orderId, orderData)
            .then(result => {
                if(result.status != "OK") {
                    toast.error(result.message);
                }else{
                    toast.success(result.message);
                    getOrders(); // refresh list
                }
            })
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    return (
        <div className="container-fluid">
            <h1 className="h3 mb-2 text-gray-800">Manage Order</h1>
            <div className="card shadow mb-4">
                <div className="card-body">
                    <div className="row mb-2">
                        <div className="col-md-3">
                            <input className="form-control form-control-sm" placeholder="Customer's Name" value={fullName} onChange={e => setFullName(e.target.value)} />
                        </div>
                        <div className="col-md-3">
                            <input className="form-control form-control-sm" placeholder="Phone number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                        </div>
                        <div className="col-md-3">
                            <input className="form-control form-control-sm" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="col-md-3">
                            <input type="date" className="form-control form-control-sm" value={orderDate} onChange={e => setOrderDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="row mb-2">
                        <div className="col-md-4">
                            <select className="form-control form-control-sm" value={status} onChange={e => setStatus(e.target.value)}>
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <select className="form-control form-control-sm" value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))}>
                                {[10, 25, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div className="col-md-4 d-flex align-items-center">
                            <input type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)} className="form-check-input me-2" />
                            <label className="form-check-label">Active</label>
                        </div>
                    </div>

                    <table className="table table-bordered table-sm">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Full name</th>
                                <th>Phone number</th>
                                <th>Email</th>
                                <th>Order date</th>
                                <th>Status</th>
                                <th>Payment Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, idx) => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{order.fullName}</td>
                                    <td>{order.phoneNumber}</td>
                                    <td>{order.email}</td>
                                    <td>{order.orderDate}</td>
                                    <td>
                                        <select className="form-control form-control-sm" value={order.status} onChange={(e) => handleStatusUpdate(order.id, e.target.value)}>
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select className="form-control form-control-sm" value={order.paymentStatus} onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value)}>
                                            <option value="paid">Paid</option>
                                            <option value="unpaid">Unpaid</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button className="detail-btn" onClick={() => navigate(`/admin/orders/detail/${order.id}`)} >
                                            <IoIosInformationCircle />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <nav>
                        <ul className="pagination justify-content-center">
                            {currentPage > 0 && (
                                <>
                                    <li className="page-item"><button className="page-link" onClick={() => setCurrentPage(0)}>First</button></li>
                                    <li className="page-item"><button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>&laquo;</button></li>
                                </>
                            )}
                            {visiblePages.map((page) => (
                                <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(page)}>{page + 1}</button>
                                </li>
                            ))}
                            {currentPage < totalPages - 1 && (
                                <>
                                    <li className="page-item"><button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>&raquo;</button></li>
                                    <li className="page-item"><button className="page-link" onClick={() => setCurrentPage(totalPages - 1)}>Last</button></li>
                                </>
                            )}
                        </ul>
                    </nav>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default OrderManagement;
