import React, { useState, useEffect } from "react";
import CheckoutForm from "./Cashier";
import "./Cashier.css"
import { FiDelete } from "react-icons/fi";

const CheckoutManager: React.FC = () => {
    const [checkoutSessions, setCheckoutSessions] = useState<string[]>([]);

    // 🔥 Khôi phục từ localStorage khi load trang
    useEffect(() => {
        const sessionIds: string[] = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("checkout_")) {
                const sessionId = key;
                sessionIds.push(sessionId);
            }
        }

        setCheckoutSessions(sessionIds);
    }, []);

    const createNewCheckout = () => {
        const newId = `checkout_${Date.now()}`;
        setCheckoutSessions((prev) => [...prev, newId]);
        localStorage.setItem(`checkoutSessions_${newId}`, JSON.stringify([])); // Khởi tạo giỏ hàng rỗng
    };

    const deleteCheckoutSession = (sessionId: string) => {
        localStorage.removeItem(sessionId); // Xoá session khỏi localStorage
        setCheckoutSessions((prev) => prev.filter((id) => id !== sessionId)); // Xoá khỏi state
    };

    return (
        <div className="container-cashier mt-4">
            <h2>Checkout Sessions</h2>
            <button className="btn btn-success mb-3" onClick={createNewCheckout}>
                Tạo phiên checkout mới
            </button>

            <div className="accordion" id="checkoutAccordion">
                {checkoutSessions.map((sessionId, index) => (
                    <div className="accordion-item" key={sessionId}>
                        <h2 className="accordion-header" id={`heading-${sessionId}`}>
                            <button
                                className="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#collapse-${sessionId}`}
                                aria-expanded="false"
                                aria-controls={`collapse-${sessionId}`}
                            >
                                Client #{index + 1} — {sessionId}
                            </button>

                            <button
                                className="btn btn-outline-danger btn-sm ms-2"
                                onClick={() => deleteCheckoutSession(sessionId)}
                            >
                                <FiDelete />
                            </button>
                        </h2>
                        <div
                            id={`collapse-${sessionId}`}
                            className="accordion-collapse collapse"
                            aria-labelledby={`heading-${sessionId}`}
                            data-bs-parent="#checkoutAccordion"
                        >
                            <div className="accordion-body">
                                <CheckoutForm sessionId={sessionId} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CheckoutManager;
