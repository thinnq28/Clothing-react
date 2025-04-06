import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderResponse } from '../../../responses/order/order.response';
import OrderService from '../../../services/OrderService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./TrackOrder.css"
import Header from '../Header/HeaderClient';
import { FaInfo } from 'react-icons/fa';

const TrackOrder: React.FC = () => {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [visiblePages, setVisiblePages] = useState<number[]>([]);

    const [fullName, setFullName] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [orderDate, setOrderDate] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [isActive, setIsActive] = useState<boolean>(true);

    const navigate = useNavigate();
    const token = localStorage.getItem('clientToken') || sessionStorage.getItem('clientToken');

    useEffect(() => {
        if (!token) {
            navigate('/haiha/login');
            return;
        }
        fetchOrders();
    }, [currentPage, itemsPerPage, fullName, phoneNumber, orderDate, email, status]);

    const fetchOrders = () => {
        if (!token) return;

        OrderService.getOrderByUser(fullName, phoneNumber, email, orderDate, status, isActive, currentPage, itemsPerPage)
            .then(response => {
                const { orders, totalPages } = response.data;
                setOrders(orders);
                setTotalPages(totalPages);
                setVisiblePages(generateVisiblePageArray(currentPage, totalPages));
            })
            .catch(error => {
                toast.error(error?.response?.data?.message || 'Error fetching orders');
            });
    };

    const generateVisiblePageArray = (current: number, total: number): number[] => {
        const maxVisible = 5;
        const half = Math.floor(maxVisible / 2);

        let start = Math.max(current - half, 0);
        let end = Math.min(start + maxVisible - 1, total - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(end - maxVisible + 1, 0);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i + 1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearch = () => {
        setCurrentPage(0); // reset về trang đầu khi tìm kiếm
        fetchOrders();
    };

    return (
        <div>
            <Header />
            <div className="container mt-5">
                <div className="d-flex justify-content-center row">
                    <div className="input-group-append">
                    </div>

                    <div className="row mt-2">
                        <div className="col-md-3">
                            <input className="form-control form-control-sm track-order" placeholder="Customer's Name" value={fullName} onChange={e => setFullName(e.target.value)} />
                        </div>
                        <div className="col-md-3">
                            <input className="form-control form-control-sm track-order" placeholder="Phone number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                        </div>
                        <div className="col-md-3">
                            <input className="form-control form-control-sm track-order" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="col-md-3">
                            <input className="form-control form-control-sm track-order" type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="row mt-2">
                        <div className="col-md-4">
                            <select className="form-control form-control-sm track-order" value={status} onChange={e => setStatus(e.target.value)}>
                                <option value="">All</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <select className="form-control form-control-sm track-order" value={itemsPerPage} onChange={e => setItemsPerPage(+e.target.value)}>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                        </div>
                    </div>

                    <div className="col-md-10 mt-3">
                        <div className="table-responsive table-borderless">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Full name</th>
                                        <th>Phone number</th>
                                        <th>Email</th>
                                        <th>Address</th>
                                        <th>Created</th>
                                        <th>Status</th>
                                        <th>Payment status</th>
                                        <th>Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, index) => (
                                        <tr key={index}>
                                            <td>{order.fullName}</td>
                                            <td>{order.phoneNumber}</td>
                                            <td>{order.email}</td>
                                            <td>{order.address}</td>
                                            <td>{new Date(order.orderDate).toLocaleString('vi-VN', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</td>
                                            <td>{order.status}</td>
                                            <td>{order.paymentStatus}</td>
                                            <td>{order.total_money} VND</td>
                                            <td>
                                                <button className="btn button-option-edit" onClick={() => navigate(`/haiha/tracking-order-detail/${order.id}`)}>
                                                    <FaInfo />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <nav className="d-flex justify-content-center">
                                <ul className="pagination">
                                    {currentPage > 0 && (
                                        <>
                                            <li className="page-item"><button className="page-link" onClick={() => handlePageChange(0)}>First</button></li>
                                            <li className="page-item"><button className="page-link" onClick={() => handlePageChange(currentPage - 1)}><i className="fa fa-chevron-left"></i></button></li>
                                        </>
                                    )}
                                    {visiblePages.map(page => (
                                        <li key={page} className={`page-item ${page === currentPage + 1 ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => handlePageChange(page - 1)}>{page}</button>
                                        </li>
                                    ))}
                                    {currentPage < totalPages - 1 && (
                                        <>
                                            <li className="page-item"><button className="page-link" onClick={() => handlePageChange(currentPage + 1)}><i className="fa fa-chevron-right"></i></button></li>
                                            <li className="page-item"><button className="page-link" onClick={() => handlePageChange(totalPages - 1)}>Last</button></li>
                                        </>
                                    )}
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
};

export default TrackOrder;
