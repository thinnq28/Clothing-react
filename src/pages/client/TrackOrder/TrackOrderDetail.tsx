import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { OrderResponse } from '../../../responses/order/order.response';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { environment } from '../../../environment/environment';
import useFetchWithAuthUser from '../../../fetch/FetchUser';
import Header from '../Header/HeaderClient';
import "./TrackOrderDetail.css"
import { FaChevronLeft } from 'react-icons/fa';
import Footer from '../Footer/FooterClient';

interface ImageDataResponse {
    url: string;
}

interface VariantResponse {
    variantName: string;
    images: ImageDataResponse[];
}

interface OrderDetailResponse {
    variant: VariantResponse;
    quantity: number;
    price: number;
}

const TrackOrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [orderDetails, setOrderDetails] = useState<OrderDetailResponse[]>([]);
    const [order, setOrder] = useState<OrderResponse>();
    const navigate = useNavigate();
    const fetchWithAuth = useFetchWithAuthUser();
    const [isCancel, setIsCancel] = useState<boolean>(false);

    useEffect(() => {
        const token = localStorage.getItem('clientToken') || sessionStorage.getItem('clientToken');

        if (!token) {
            navigate('/haiha/login');
            return;
        }

        const orderId = Number(id);
        if (!isNaN(orderId)) {
            fetchOrderDetails(orderId, token);
            fetchOrder(orderId);
        }
    }, [id]);

    const fetchOrderDetails = async (orderId: number, token: string) => {
        try {
            fetchWithAuth(`/orders/order-detail/${orderId}`, {
                method: "POST"
            })
                .then(result => {
                    if (result.status != "OK") {
                        toast.error(result.data);
                    } else {
                        const details = result.data.map((item: OrderDetailResponse) => {
                            const updatedImages = item.variant.images.map((img) => ({
                                ...img,
                                url: `${environment.apiBaseUrl}/variants/images/${img.url}`,
                            }));
                            return {
                                ...item,
                                variant: {
                                    ...item.variant,
                                    images: updatedImages,
                                },
                            };
                        });

                        setOrderDetails(details);
                    }
                })
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to fetch order details');
        }
    };

    const fetchOrder = async (orderId: number) => {
        try {
            fetchWithAuth(`/orders/${orderId}`)
                .then(result => {
                    if (result.status != "OK") {
                        toast.error(result.message);
                    } else {
                        setOrder(result.data);
                        setIsCancel(result.data.status == 'cancelled');
                    }
                })

        } catch (err) {
            // Optional: toast.error
        }
    };

    const cancelOrder = async () => {
        fetchWithAuth(`/orders/cancel/${id}`, {
            method: "PUT"
        })
        .then(result => {
            if (result.status != "OK") {
                toast.error(result.data);
            } else {
                toast.success(result.data)
                setTimeout(() => navigate(0), 2000);
            }
        }).catch(error => {
            toast.error(error.data);
            console.log(error);
        })
    }

    return (
        <>
            <Header />
            <div className="container">
                <article className="card-order">
                    <header className="card-header-order">Đơn hàng / Theo dõi</header>
                    <div className="card-body-order">
                        <h6>Order ID: OD{order?.id}</h6>
                        <div className="track">
                            <div className="step active">
                                <span className="icon"><i className="fa fa-check" /></span> <span className="text" />
                            </div>
                            <div className="step active">
                                <span className="icon"><i className="fa fa-user" /></span> <span className="text" />
                            </div>
                            <div className="step active">
                                <span className="icon"><i className="fa fa-truck" /></span> <span className="text" />
                            </div>
                            <div className="step active">
                                <span className="icon"><i className="fa fa-box" /></span> <span className="text" />
                            </div>
                        </div>
                        <hr />
                        <ul className="row">
                            {orderDetails.map((detail, index) => (
                                <li className="col-md-4" key={index}>
                                    <figure className="itemside mb-3">
                                        <div className="aside">
                                            <img src={detail.variant.images[0]?.url} className="img-sm border" alt="Product" />
                                        </div>
                                        <figcaption className="info align-self-center">
                                            <p className="title">
                                                {detail.variant.variantName} <br />
                                                Số lượng: {detail.quantity}
                                            </p>
                                            <span className="text-muted">{detail.price} VND</span>
                                        </figcaption>
                                    </figure>
                                </li>
                            ))}
                        </ul>
                        <hr />
                        <Link to="/haiha/tracking-order" className="btn btn-warning">
                            <FaChevronLeft/> Trở về
                        </Link>

                       {!isCancel && ( <button className="btn btn-danger" onClick={cancelOrder} >
                            Huỷ đơn hàng
                        </button>)}
                    </div>
                </article>
            </div>

            <Footer />
            <ToastContainer position="bottom-center" autoClose={5000} />
        </>
    );
};

export default TrackOrderDetail;
