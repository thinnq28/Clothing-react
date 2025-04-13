import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import HeaderClient from '../../client/Header/HeaderClient';
import { useNavigate } from 'react-router-dom';
import { getCart, setCart, clearCart } from '../../../services/CartService';
import OrderService from '../../../services/OrderService';
import ClientService from '../../../services/ClientService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { environment } from '../../../environment/environment';
import axios from 'axios';
import "./OrderClient.css";
import { usePayOS } from "@payos/payos-checkout";
import Footer from '../Footer/FooterClient';

interface PayOSConfig {
    RETURN_URL: string;
    ELEMENT_ID: string;
    CHECKOUT_URL: string;
    embedded: boolean;
    onSuccess: (event: any) => void;
}

interface item {
    itemName: string,
    itemPrice: number,
    itemQuantity: number
}

const OrderPage: React.FC = () => {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState<any[]>([]);
    const [cart, setCartMap] = useState<Map<number, number>>(new Map());
    const [voucher, setVoucher] = useState<any | null>(null);
    const [oldVouchers, setOldVouchers] = useState<string[]>([]);
    const [code, setCode] = useState('');
    const [totalAmount, setTotalAmount] = useState(0);
    const [userData, setUserData] = useState<any | null>(null);

    // Formik Form
    const formik = useFormik({
        initialValues: {
            fullName: '',
            email: '',
            phoneNumber: '',
            address: '',
            note: '',
            paymentMethod: 'cod',
        },
        validationSchema: Yup.object({
            fullName: Yup.string().required('Họ và tên là bắt buộc'),
            email: Yup.string().email('Email không hợp lệ'),
            phoneNumber: Yup.string().required('Số điện thoại là bắt buộc').min(6, 'Ít nhất 6 ký tự'),
            address: Yup.string().required('Địa chỉ là bắt buộc').min(5, 'Ít nhất 5 ký tự'),
        }),
        onSubmit: async (values) => {

            debugger
            const cart_items = cartItems.map(item => ({
                variantId: item.variant.id,
                quantity: item.quantity,
            }));

            const orderData = {
                ...values,
                userId: userData?.id || 0,
                cart_items,
                codes: oldVouchers,
                totalMoney: totalAmount,
                status: 'pending',
                orderCode: null
            };

            try {

                let orderId = null;

                await OrderService.placeOrder(orderData)
                    .then(result => {
                        if (result.status != 200) {
                            toast.error('Lỗi khi đặt hàng');
                            if (Array.isArray(result.data)) {
                                result.data.forEach((msg: string) => toast.error(msg));
                              } 
                            return;
                        } else {
                            if (orderData.paymentMethod == 'cod') {
                                setTimeout(() => navigate('/haiha'), 2000);
                                toast.success('Đặt hàng thành công!');
                                clearCart();
                            }

                            orderId = result.data.data.id;
                        }
                    });
                    
                    if (orderData.paymentMethod != 'cod' && orderId != null) {
                        const items: item[] = cartItems.map(cartItem => ({
                            itemName: cartItem.variant.variantName,
                            itemPrice: cartItem.variant.price,
                            itemQuantity: cartItem.quantity,
                        }));
                        handleGetPaymentLink(items, orderId);
                    }


            } catch (error: any) {
                toast.error('Lỗi khi đặt hàng');
                toast.error(error.response?.data?.message || 'Lỗi khi đặt hàng');
                return;
            }
        },
    });


    const getVariantByIds = async (ids: number[]) => {
        const params = {
            ids: ids.toString(),
        };

        try {
            const response = await axios.get(`${environment.apiBaseUrl}/client/variant/by-ids`, { params });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch variants by IDs:", error);
            throw error;
        }
    };

    const getVoucherByCode = async (voucherCode: string, userId: number) => {
        try {
            const response = await axios.get(`${environment.apiBaseUrl}/client/voucher/by-code`, {
                params: {
                    code: voucherCode,
                    userId: userId,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch voucher by code:", error);
            throw error;
        }
    };

    useEffect(() => {
        const cartMap = getCart();
        setCartMap(cartMap);
        const ids = Array.from(cartMap.keys());

        if (ids.length === 0) return;

        getVariantByIds(ids).then((response: any) => {
            const items = ids.map(id => {
                const variant = response.data.find((v: any) => v.id === id);
                variant.images = variant.images.map((img: any) => ({
                    ...img,
                    url: `${environment}/variants/images/${img.url}`,
                }));
                return { variant, quantity: cartMap.get(id) };
            });
            setCartItems(items);
        });

        const token = localStorage.getItem('clientToken');
        if (token) {
            ClientService.getUserDetail(token).then((res: any) => {
                setUserData(res.data);
            });
        }
    }, []);

    useEffect(() => {
        calculateTotal();
    }, [cartItems, voucher]);

    const calculateTotal = () => {
        let total = cartItems.reduce(
            (sum, item) => sum + item.variant.price * item.quantity,
            0
        );

        if (voucher) {
            let discount = 0;
            if (voucher.discountType === 'percentage') {
                discount = (total * voucher.discount) / 100;
                if (discount > voucher.maxDiscountAmount) discount = voucher.maxDiscountAmount;
            } else {
                discount = voucher.discount;
            }
            total -= discount;
        }

        setTotalAmount(Math.max(0, total));
    };

    const increaseQuantity = (index: number) => {
        const updated = [...cartItems];
        updated[index].quantity += 1;
        setCartItems(updated);
        syncCart(updated);
    };

    const decreaseQuantity = (index: number) => {
        const updated = [...cartItems];
        if (updated[index].quantity > 1) {
            updated[index].quantity -= 1;
            setCartItems(updated);
            syncCart(updated);
        }
    };

    const removeItem = (index: number) => {
        const updated = [...cartItems];
        updated.splice(index, 1);
        setCartItems(updated);
        syncCart(updated);
    };

    const syncCart = (items: any[]) => {
        const map = new Map<number, number>();
        items.forEach(item => {
            map.set(item.variant.id, item.quantity);
        });
        setCart(map);
        setCartMap(map);
    };

    const applyCoupon = async () => {
        if (oldVouchers.includes(code)) {
            toast.error('Bạn đã dùng mã này rồi');
            return;
        }

        let userId = 0;
        const token = localStorage.getItem('clientToken');

        if (token) {
            try {
                const res = await ClientService.getUserDetail(token);
                const user = res.data;

                const isGuest = user.roles.some((role: any) => role.name === 'GUEST');
                if (isGuest) {
                    userId = user.id;
                }
            } catch (error) {
                console.error('Lỗi khi lấy thông tin user:', error);
            }
        }

        try {
            const response = await getVoucherByCode(code, userId);
            const newVoucher = response.data;

            // Áp dụng discount
            let discountAmount = 0;
            let total = cartItems.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);

            if (newVoucher.discountType == 'percentage') {
                discountAmount = (total * newVoucher.discount) / 100;
                if (discountAmount > newVoucher.maxDiscountAmount) {
                    discountAmount = newVoucher.maxDiscountAmount;
                }
            } else {
                discountAmount = newVoucher.discount;
            }

            total -= discountAmount;
            setTotalAmount(Math.max(0, total));

            // Lưu voucher vào state
            setVoucher(newVoucher);
            setOldVouchers([...oldVouchers, newVoucher.code]);

            toast.success(`Áp dụng mã giảm ${discountAmount.toLocaleString()}₫ thành công`);

            // OPTIONAL: thêm render danh sách voucher đã áp dụng nếu bạn muốn giống Angular

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không tìm thấy mã');

            const errors = error.response?.data?.data || [];
            errors.forEach((err: any) => {
                toast.error(err);
            });
        }
    };

    const removeVoucher = (codeToRemove: string) => {
        const updated = oldVouchers.filter(code => code !== codeToRemove);
        setOldVouchers(updated);
        setVoucher(null);
        calculateTotal();
        toast.info(`Đã xoá mã ${codeToRemove}`);
    };


    //thanh toan    
    const handleGetPaymentLink = async (items: item[], orderId: string) => {
        try {

            const checkoutDTO = {
                amount: totalAmount,
                items: items,
                orderId: orderId,
                returnUrl: "haiha/payment-success",
                cancelUrl: "haiha/payment-cancel",
            }

            await axios.post(`${environment.apiBaseUrl}/client/create-payment-link`, checkoutDTO)
                .then(result => {
                    debugger
                    if (result.status != 200) {
                        toast.error('Đã có lỗi khi tạo mã QR');
                        return;
                    } else {
                        const data = result.data.data;
                        clearCart();
                        window.location.href = data.checkoutUrl;
                    }
                })
        } catch (error) {
            toast.error('Đã có lỗi khi tạo mã QR');
            console.error("Error creating payment link:", error);
        } 
    };

    return (
        <>
            <HeaderClient />
            <div className="container">
                <div className="introSection">
                    <h1 className="mb-4">Đây là trang Order</h1>
                </div>

                <form onSubmit={formik.handleSubmit}>
                    <div className="row">
                        {/* Thông tin người nhận */}
                        <div className="col-md-5 productHeader">
                            <h4>Thông tin người nhận</h4>
                            {(['fullName', 'email', 'phoneNumber', 'address', 'note'] as const).map((field, i) => (
                                <div className="mb-3" key={i}>
                                    <label className="formLabel">
                                        {field === 'fullName' ? 'Họ và tên' :
                                            field === 'email' ? 'Email' :
                                                field === 'phoneNumber' ? 'Số điện thoại' :
                                                    field === 'address' ? 'Địa chỉ' : 'Ghi chú'}
                                    </label>
                                    <input
                                        type="text"
                                        name={field}
                                        className={`form-control ${formik.touched[field] && formik.errors[field] ? 'is-invalid' : ''
                                            }`}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values[field]}
                                    />
                                    {formik.touched[field] && formik.errors[field] && (
                                        <div className="invalid-feedback">{formik.errors[field]}</div>
                                    )}
                                </div>
                            ))}

                            <div className="mb-3">
                                <label>Phương thức thanh toán</label>
                                <select
                                    name="paymentMethod"
                                    className="form-control"
                                    onChange={formik.handleChange}
                                    value={formik.values.paymentMethod}
                                >
                                    <option value="cod">Thanh toán khi nhận hàng</option>
                                    <option value="other">Thanh toán khác</option>
                                </select>
                            </div>
                        </div>

                        {/* Sản phẩm */}
                        <div className="col-md-7">
                            <h4 className="productOrder">Sản phẩm đã đặt</h4>
                            <table className="tableOrder">
                                <tbody>
                                    {cartItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="d-flex align-items-center productInfo">
                                                    <img src={`${environment.apiBaseUrl}/variants/images/${item.variant.imageUrls[0]}`} width={60} className="me-2 productImage" alt="product" />
                                                    <span className="productName">{item.variant.variantName}</span>
                                                </div>
                                            </td>
                                            <td className="productQuantity">
                                                <div className="borderWrapper">
                                                    <button onClick={() => decreaseQuantity(index)}>-</button>
                                                    <span className="mx-2">{item.quantity}</span>
                                                    <button onClick={() => increaseQuantity(index)}>+</button>
                                                </div>
                                            </td>
                                            <td>{item.variant.price.toLocaleString()}₫</td>
                                            <td>{(item.variant.price * item.quantity).toLocaleString()}₫</td>
                                            <td>
                                                <button className="btn btn-danger btn-sm" onClick={() => removeItem(index)}>Xóa</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Tổng tiền */}
                            <h5 className="text-end" style={{ marginTop: "20px" }}>Tổng giá: {totalAmount.toLocaleString()}₫</h5>

                            {/* Mã giảm giá */}
                            <div className="my-3">
                                <label className="productHeader">Nhập coupon</label>
                                <div className="input-group mb-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={code}
                                        onChange={e => setCode(e.target.value)}
                                        placeholder="Nhập mã giảm giá..."
                                    />
                                    <button type="button" className="btn btn-primary" onClick={applyCoupon}>Áp dụng</button>
                                </div>

                                {/* Thẻ voucher đã áp dụng */}
                                <div className="d-flex flex-wrap gap-2">
                                    {oldVouchers.map((v, idx) => (
                                        <div key={idx} className="voucher-tag">
                                            <span>{v}</span>
                                            <button type="button" onClick={() => removeVoucher(v)}>&times;</button>
                                        </div>
                                    ))}
                                </div>
                            </div>


                            {/* Submit */}
                            <button type="submit" className="btn btn-success mt-3 btnGradient">Đặt hàng</button>
                        </div>
                    </div>
                </form>
            </div>

            <Footer />


        </>
    );
};

export default OrderPage;
