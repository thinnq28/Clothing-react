// import React, { useState, useEffect } from "react";
// import { usePayOS } from "@payos/payos-checkout";
// import { environment } from "../../../environment/environment";

// interface PayOSConfig {
//   RETURN_URL: string;
//   ELEMENT_ID: string;
//   CHECKOUT_URL: string;
//   embedded: boolean;
//   onSuccess: (event: any) => void;
// }

// const ProductDisplay: React.FC = () => {
//   const [isOpen, setIsOpen] = useState<boolean>(false);
//   const [message, setMessage] = useState<string>("");
//   const [isCreatingLink, setIsCreatingLink] = useState<boolean>(false);

//   const [payOSConfig, setPayOSConfig] = useState<PayOSConfig>({
//     RETURN_URL: "http://localhost:5173/",
//     ELEMENT_ID: "embedded-payment-container",
//     CHECKOUT_URL: "",
//     embedded: true,
//     onSuccess: (event) => {
//       setIsOpen(false);
//       setMessage("Thanh toán thành công");
//     },
//   });

//   const { open, exit } = usePayOS(payOSConfig);

//   const handleGetPaymentLink = async () => {
//     try {
//       setIsCreatingLink(true);
//       exit();

//       const response = await fetch(`${environment.apiBaseUrl}/client/create-payment-link`, {
//         method: "POST",
//         body: 
//       });

//       if (!response.ok) {
//         console.error("Server doesn't respond");
//         return;
//       }

//       const result = await response.json();
//       setPayOSConfig((oldConfig) => ({
//         ...oldConfig,
//         CHECKOUT_URL: result.checkoutUrl,
//       }));

//       setIsOpen(true);
//     } catch (error) {
//       console.error("Error creating payment link:", error);
//     } finally {
//       setIsCreatingLink(false);
//     }
//   };

//   useEffect(() => {
//     if (payOSConfig.CHECKOUT_URL != null) {
//       open();
//     }
//   }, [payOSConfig, open]);

//   return message ? (
//     <Message message={message} />
//   ) : (
//     <div className="main-box">
//       <div>
//         <div className="checkout">
//           <div className="product">
//             <p>
//               <strong>Tên sản phẩm:</strong> Mì tôm Hảo Hảo ly
//             </p>
//             <p>
//               <strong>Giá tiền:</strong> 2000 VNĐ
//             </p>
//             <p>
//               <strong>Số lượng:</strong> 1
//             </p>
//           </div>
//           <div className="flex">
//             {!isOpen ? (
//               <div>
//                 {isCreatingLink ? (
//                   <div style={{ textAlign: "center", padding: "10px", fontWeight: 600 }}>
//                     Creating Link...
//                   </div>
//                 ) : (
//                   <button
//                     id="create-payment-link-btn"
//                     onClick={(event) => {
//                       event.preventDefault();
//                       handleGetPaymentLink();
//                     }}
//                   >
//                     Tạo Link thanh toán Embedded
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <button
//                 style={{
//                   backgroundColor: "gray",
//                   color: "white",
//                   width: "100%",
//                   paddingTop: "10px",
//                   paddingBottom: "10px",
//                   fontSize: "14px",
//                   marginTop: "5px",
//                 }}
//                 onClick={(event) => {
//                   event.preventDefault();
//                   setIsOpen(false);
//                   exit();
//                 }}
//               >
//                 Đóng Link
//               </button>
//             )}
//           </div>
//         </div>
//         {isOpen && (
//           <div style={{ maxWidth: "400px", padding: "2px" }}>
//             Sau khi thực hiện thanh toán thành công, vui lòng đợi từ 5 - 10s để hệ thống tự động cập nhật.
//           </div>
//         )}
//         <div
//           id="embedded-payment-container"
//           style={{
//             height: "350px",
//           }}
//         ></div>
//       </div>
//     </div>
//   );
// };

// interface MessageProps {
//   message: string;
// }

// const Message: React.FC<MessageProps> = ({ message }) => (
//   <div className="main-box">
//     <div className="checkout">
//       <div className="product" style={{ textAlign: "center", fontWeight: 500 }}>
//         <p>{message}</p>
//       </div>
//       <form action="/">
//         <button type="submit" id="create-payment-link-btn">
//           Quay lại trang thanh toán
//         </button>
//       </form>
//     </div>
//   </div>
// );
