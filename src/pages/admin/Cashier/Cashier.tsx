import React, { useEffect, useRef, useState } from "react";
import AsyncSelect from "react-select/async";
import "bootstrap/dist/css/bootstrap.min.css";
import VariantService from "../../../services/VariantService";
import { environment } from "../../../environment/environment";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import userService from "../../../services/userService";
import { useNavigate } from "react-router-dom";
import OrderService from "../../../services/OrderService";

interface item {
  itemName: string,
  itemPrice: number,
  itemQuantity: number
}

type OptionType = {
  value: string;
  label: string;
  variantData: any;
};

interface CheckoutFormProps {
  sessionId: string | number;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ sessionId }) => {

  // Thêm bên trong component CheckoutForm
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [voucher, setVoucher] = useState<any | null>(null);
  const [code, setCode] = useState('');
  const [phoneForVoucher, setPhoneForVoucher] = useState('');
  const [totalDiscount, setTotalDiscount] = useState<number>(0);
  const navigate = useNavigate();

  // Load từ localStorage (chỉ chạy 1 lần khi mount)
  useEffect(() => {
    const key = String(sessionId);
    const saved = localStorage.getItem(key);
    if (saved) {
      setCartItems(JSON.parse(saved));
    }
    setHasLoaded(true); // đánh dấu đã load xong
  }, [sessionId]);

  // Lưu vào localStorage sau khi đã load xong lần đầu
  useEffect(() => {
    if (!hasLoaded) return;

    const key = String(sessionId);
    localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems, sessionId, hasLoaded]);

  const handleAddProduct = (selectedOption: any) => {
    const variant = selectedOption.variantData;
    setCartItems((prevItems) => {
      const index = prevItems.findIndex((item) => item.variant.id === variant.id);
      if (index !== -1) {
        // Nếu đã có, tăng số lượng
        const updated = [...prevItems];
        updated[index].quantity += 1;
        return updated;
      } else {
        // Nếu chưa có, thêm mới
        return [...prevItems, { variant, quantity: 1 }];
      }
    });
  };

  const increaseQuantity = (index: number) => {
    setCartItems((prev) => {
      const updated = [...prev];
      updated[index].quantity += 1;
      return updated;
    });
    calculateTotal(); // Gọi tính toán tổng sau khi thay đổi số lượng
  };


  const decreaseQuantity = (index: number) => {
    setCartItems((prev) => {
      const updated = [...prev];
      if (updated[index].quantity > 1) {
        updated[index].quantity -= 1;
      }
      return updated;
    });
    calculateTotal(); // Gọi tính toán tổng sau khi thay đổi số lượng
  };



  const loadOptions = async (inputValue: string): Promise<OptionType[]> => {
    if (!inputValue.trim()) return [];

    try {
      const result = await VariantService.getVariantByName(inputValue);
      if (result.status == "OK") {
        return result.data.map((variant: any) => ({
          value: variant.id,
          label: variant.variantName,
          variantData: {
            id: variant.id,
            image: `${environment.apiBaseUrl}/variants/images/${variant.imageUrls[0]}`,
            price: variant.price,
            name: variant.variantName,
          },
        }));
      }

      return [];
    } catch (error) {
      console.error("Failed to fetch variants:", error);
      return [];
    }
  };

  const removeItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };


  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const handleSubmit = (event: Event) => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add("was-validated");
    };

    form.addEventListener("submit", handleSubmit);
    return () => form.removeEventListener("submit", handleSubmit);
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [cartItems, voucher]);

  useEffect(() => {
    let total = cartItems.reduce(
      (sum, item) => sum + item.variant.price * item.quantity,
      0
    );

    setTotalDiscount(total - totalAmount);
  })

  const calculateTotal = () => {
    let total = cartItems.reduce(
      (sum, item) => sum + item.variant.price * item.quantity,
      0
    );

    let discount = 0;
    if (voucher) {
      if (voucher.discountType === 'percentage') {
        discount = (total * voucher.discount) / 100;
        if (discount > voucher.maxDiscountAmount) {
          discount = voucher.maxDiscountAmount;
        }
      } else {
        discount = voucher.discount;
      }
      total -= discount;
    }

    setTotalAmount(Math.max(0, Math.round(total)));
  };

  const removeVoucher = () => {
    setVoucher(null);
    calculateTotal();
    toast.info(`Deleting voucher`);
  };


  const applyCoupon = async () => {
    if (voucher && code == voucher.code) {
      toast.error('You has been using this voucher');
      return;
    }

    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await getVoucherByCode(code, phoneForVoucher);
      const newVoucher = response.data;

      setVoucher(newVoucher); // trigger useEffect to recalculate
      toast.success(`Coupon code applied: ${newVoucher.code}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Code is not found');
      const errors = error.response?.data?.data || [];
      errors.forEach((err: any) => toast.error(err));
    }
  };

  const getVoucherByCode = async (voucherCode: string, phoneNumber: string) => {
    try {
      const response = await axios.get(`${environment.apiBaseUrl}/client/voucher/by-code/phone-number`, {
        params: {
          code: voucherCode,
          phoneNumber: phoneNumber,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch voucher by code:", error);
      throw error;
    }
  };

  //thanh toan    
  const handleGetPaymentLink = async (items: item[], orderId: string) => {
    try {

      const checkoutDTO = {
        amount: totalAmount,
        items: items,
        orderId: orderId,
        returnUrl: "admin/payment-success",
        cancelUrl: "admin/payment-cancel",
      }

      await axios.post(`${environment.apiBaseUrl}/client/create-payment-link`, checkoutDTO)
        .then(result => {
          if (result.status != 200) {
            toast.error('There was an error generating the QR code.');
            return;
          } else {
            const data = result.data.data;
            // Optional: Clear cart & voucher sau khi tạo đơn
            setCartItems([]);
            setVoucher(null);
            setCode('');
            localStorage.removeItem(String(sessionId));
            window.location.href = data.checkoutUrl;
          }
        })
    } catch (error) {
      toast.error('There was an error generating the QR code.');
      console.error("Error creating payment link:", error);
    }
  };


  // Thêm vào trong component CheckoutForm
  const handleSubmitCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = formRef.current;
    if (!form || !form.checkValidity()) {
      form?.classList.add("was-validated");
      return;
    }

    try {
      const orderItems = cartItems.map(item => ({
        variantId: item.variant.id,
        quantity: item.quantity
      }));

      let userId = 0;

      try {
        const res = await userService.getUserDetail();
        const user = res.data;
        userId = user.id;
      } catch (error) {
        console.error('Lỗi khi lấy thông tin user:', error);
        return;
      }

      const orderData = {
        userId: userId,
        fullName: (form.querySelector("#firstName") as HTMLInputElement).value,
        phoneNumber: (form.querySelector("#phoneNumber") as HTMLInputElement).value,
        email: (form.querySelector("#email") as HTMLInputElement)?.value || "",
        address: (form.querySelector("#address") as HTMLInputElement).value,
        note: "",
        totalMoney: totalAmount,
        codes: Array.of(voucher?.code),
        cart_items: orderItems,
        paymentMethod: (form.querySelector('input[name="paymentMethod"]:checked') as HTMLInputElement).value,
        status: 'pending',
        orderCode: null,
        updatedBy: userId
      };

      debugger
      let orderId = null;
      await OrderService.placeOrder(orderData)
        .then(result => {
          if (result.status != 200) {
            if (Array.isArray(result.data.data)) {
              result.data.forEach((msg: string) => toast.error(msg));
            } 
          } else {
            if (orderData.paymentMethod == 'cod') {
              setTimeout(() => navigate('/admin/cashier'), 2000);
              toast.success('Create Order is successful');
              // Optional: Clear cart & voucher sau khi tạo đơn
              setCartItems([]);
              setVoucher(null);
              setCode('');
              localStorage.removeItem(String(sessionId));
            }
            orderId = result.data.data.id;
          }
        });

      if (orderData.paymentMethod != 'cod' && orderId != null) {
        const items: item[] = cartItems.map(cartItem => ({
          itemName: cartItem.variant.name,
          itemPrice: cartItem.variant.price,
          itemQuantity: cartItem.quantity,
        }));
        handleGetPaymentLink(items, orderId);
      }
    }
    catch (error: any) {
      debugger
      toast.error(error.response?.data?.messagee || "Create Order is Failed");
      const errors = error.response.data.data;  
      if (errors.length > 0) {
        errors.forEach((msg: string) => toast.error(msg));
      } 
    }
  };

  return (
    <div className="container-cashier bg-light">
      <main>
        <div className="py-5 text-center">
          <img
            className="d-block mx-auto mb-4"
            src="https://github.com/thinnq28/Clothing-react/blob/be0220446b3aac9dd658f0b7d0e4d85c5d681015/src/assets/react.svg"
            alt=""
            width="72"
            height="57"
          />
          <h2>Checkout form</h2>
        </div>

        <div className="row g-5">
          <div className="col-md-7 col-lg-7 order-md-last">
            <h4 className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-primary">Your cart</span>
              <span className="badge bg-primary rounded-pill">{cartItems.length}</span>
            </h4>

            <ul className="list-group mb-4">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center productInfo">
                          <img
                            src={`${item.variant.image}`}
                            width={60}
                            className="me-2 productImage"
                            alt="product"
                          />
                          <span className="productName">{item.variant.name}</span>
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
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => removeItem(index)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>


              <li className="list-group-item d-flex justify-content-between bg-light align-items-start">
                <div className="text-success">
                  <h6 className="my-0 mb-2">Voucher</h6>
                  {voucher && (
                    <div className="voucher-tag-cashier">
                      <small>{voucher.code}</small>
                      <button type="button" onClick={removeVoucher}>&times;</button>
                    </div>
                  )}
                </div>
                <span className="text-success fw-bold">{totalDiscount.toLocaleString()}₫</span>
              </li>



              <li className="list-group-item d-flex justify-content-between">
                <span>Total (VND)</span>
                <strong>{totalAmount.toLocaleString()}₫</strong>
              </li>
            </ul>

            <AsyncSelect
              cacheOptions
              loadOptions={loadOptions}
              onChange={handleAddProduct}
              placeholder="Nhập tên sản phẩm..."
            />

            <div>
              <form className="card p-2" style={{ marginTop: "10px" }}>
                <div className="input-group">
                  <input type="text" className="form-control"
                    value={code}
                    onChange={e => setCode(e.target.value)} placeholder="Voucher code" />
                  <button type="button" className="btn btn-secondary" onClick={applyCoupon}>Redeem</button>
                </div>
              </form>
            </div>

          </div>

          <div className="col-md-5 col-lg-5">
            <h4 className="mb-3">Billing address</h4>
            <form className="needs-validation" noValidate ref={formRef} onSubmit={handleSubmitCheckout}>
              <div className="row g-3">
                <div className="col-sm-6">
                  <label htmlFor="firstName" className="form-label">
                    Full name
                  </label>
                  <input type="text" className="form-control" id="firstName" required />
                  <div className="invalid-feedback">Valid first name is required.</div>
                </div>
                <div className="col-sm-6">
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number
                  </label>
                  <input type="text" className="form-control" id="phoneNumber" required />
                  <div className="invalid-feedback">Valid phone number is required.</div>
                </div>
                <div className="col-12">
                  <label htmlFor="email" className="form-label">
                    Email <span className="text-muted">(Optional)</span>
                  </label>
                  <input type="email" className="form-control" id="email" placeholder="you@example.com" />
                  <div className="invalid-feedback">
                    Please enter a valid email address for shipping updates.
                  </div>
                </div>
                <div className="col-12">
                  <label htmlFor="address" className="form-label">
                    Address
                  </label>
                  <input type="text" className="form-control" id="address" placeholder="1234 Main St" required />
                  <div className="invalid-feedback">Please enter your shipping address.</div>
                </div>
              </div>

              <hr className="my-4" />

              <h4 className="mb-3">Payment</h4>

              <div className="my-3">
                <div className="form-check">
                  <input
                    id="credit"
                    name="paymentMethod"
                    type="radio"
                    className="form-check-input"
                    defaultChecked
                    value="other"
                    required
                  />
                  <label className="form-check-label" htmlFor="credit">
                    Bank transfer
                  </label>
                </div>
                <div className="form-check">
                  <input
                    id="debit"
                    name="paymentMethod"
                    type="radio"
                    className="form-check-input"
                    value="cod"
                    required
                  />
                  <label className="form-check-label" htmlFor="debit">
                    Cash
                  </label>
                </div>

              </div>

              <hr className="my-4" />

              <button className="w-100 btn btn-primary btn-lg" type="submit">
                Continue to checkout
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="my-5 pt-5 text-muted text-center text-small">
        <p className="mb-1">&copy; 2017–2021 Company Name</p>
        <ul className="list-inline">
          <li className="list-inline-item">
            <a href="#">Privacy</a>
          </li>
          <li className="list-inline-item">
            <a href="#">Terms</a>
          </li>
          <li className="list-inline-item">
            <a href="#">Support</a>
          </li>
        </ul>
      </footer>
    </div>
  );
};

export default CheckoutForm;
