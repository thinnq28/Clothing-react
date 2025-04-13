import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedAdminRoute from "./auth/admin/ProtectedRoute";
import { AuthAdminProvider } from "./auth/admin/AuthContextType";
import AdminDashboard from "./pages/admin/home/home";
import LoginAdmin from "./pages/admin/login/Login";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import ChangePassword from "./pages/admin/ChangePassword/ChangePassword";
import CommodityComponent from "./pages/admin/Commodity/Commodity";
import OptionComponent from "./pages/admin/option/OptionComponent";
import OptionValueComponent from "./pages/admin/optionValue/OptionValueComponent";
import ProductComponent from "./pages/admin/product/ProductComponent";
import InsertProduct from "./pages/admin/product/create/InsertProduct";
import UpdateProduct from "./pages/admin/product/update/UpdateProduct";
import SupplierComponent from "./pages/admin/supplier/SupplierComponent";
import PromotionComponent from "./pages/admin/promotion/PromotionComponent";
import VoucherManagement from "./pages/admin/voucher/VourcherComponent";
import AddPromotionVariant from "./pages/admin/promotion/AddPromotionForProduct/AddPromotionForProduct";
import VariantManager from "./pages/admin/variant/VariantComponent";
import InsertVariant from "./pages/admin/variant/insert/InsertVariant";
import { UpdateVariant } from "./pages/admin/variant/update/UpdateVariant";
import UserManagement from "./pages/admin/user/UserManagement";
import AuthorizationUser from "./pages/admin/authorizationUser/AuthorizationUser";
import { SelfEdit } from "./pages/admin/SelfEdit/SelfEdit";
import ForbiddenPage from "./components/Forbidden";
import NotFoundPage from "./components/NotFoundPage";
import HomeClient from "./pages/client/Home/HomeClient";
import LoginClient from "./pages/client/Login/LoginClient";
import ProductDetail from "./pages/client/Product/ProductClient";
import OrderPage from "./pages/client/Order/OrderClient";
import PaymentSuccess from "./pages/client/Order/PaymentSuccess";
import TrackOrder from "./pages/client/TrackOrder/TrackOrder";
import TrackOrderDetail from "./pages/client/TrackOrder/TrackOrderDetail";
import TrackOrderWithPhoneNumber from "./pages/client/TrackOrder/TrackOrderWithPhoneNumber";
import CheckoutForm from "./pages/admin/Cashier/Cashier";
import CheckoutManager from "./pages/admin/Cashier/CheckoutManager";
import PaymentSuccessCashier from "./pages/admin/Cashier/PaymentSuccess";
import PaymentCancel from "./pages/client/Order/CancelPayment";
import PaymentCancelCashier from "./pages/admin/Cashier/CancelPayment";
import PageWithDelay from "./components/PayWithDelay";
import OrderManagement from "./pages/admin/Order/Order";
import OrderDetail from "./pages/admin/Order/OrderDetail";
import Dashboard from "./pages/admin/Dashboard/Dashboard";
const client = "/haiha";
const App = () => {

  const wrapWithDelay = (component: React.ReactNode) => (
    <PageWithDelay>{component}</PageWithDelay>
  );

  return (

    <Router>

      <Routes>
        {/* Route dành cho khách hàng */}
        <Route path="/haiha" element={wrapWithDelay(<HomeClient />)} />
        <Route path="/haiha/login" element={wrapWithDelay(<LoginClient />)} />
        <Route path="/haiha/product/:id" element={wrapWithDelay(<ProductDetail />)} />
        <Route path="/haiha/orders" element={wrapWithDelay(<OrderPage />)} />
        <Route path="/haiha/payment-success" element={wrapWithDelay(<PaymentSuccess />)} />
        <Route path="/haiha/payment-cancel" element={wrapWithDelay(<PaymentCancel />)} />
        <Route path="/haiha/tracking-order" element={wrapWithDelay(<TrackOrder />)} />
        <Route path="/haiha/tracking-order/phone-number/:phone_number" element={wrapWithDelay(<TrackOrderWithPhoneNumber />)} />
        <Route path="/haiha/tracking-order-detail/:id" element={wrapWithDelay(<TrackOrderDetail />)} />
      </Routes>


      <AuthAdminProvider>
        <Routes>
          {/* Admin login và forbidden */}
          <Route path="/admin/login" element={wrapWithDelay(<LoginAdmin />)} />
          <Route path="/admin/forbidden" element={wrapWithDelay(<ForbiddenPage />)} />

          {/* Route chỉ dành cho Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<AdminDashboard />)}
              </ProtectedAdminRoute>
            }
          >
            <Route path="/admin/change-password" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<ChangePassword />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/commodities" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<CommodityComponent />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/options" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<OptionComponent />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/options/:id" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<OptionValueComponent />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/products" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<ProductComponent />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/products/create" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<InsertProduct />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/products/edit/:id" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<UpdateProduct />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/suppliers" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<SupplierComponent />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/promotions" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<PromotionComponent />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/vouchers" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<VoucherManagement />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/promotions/add-for-variant/:id" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<AddPromotionVariant />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/variants" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<VariantManager />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/variants/create" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<InsertVariant />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/variants/edit/:id" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<UpdateVariant />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/user-management" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<UserManagement />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/authorization-user" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<AuthorizationUser />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/profile" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<SelfEdit />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/cashier" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<CheckoutManager />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/orders" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<OrderManagement />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/orders/detail/:id" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<OrderDetail />)}
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/dashboard" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                {wrapWithDelay(<Dashboard />)}
              </ProtectedAdminRoute>
            } />
          </Route>

          {/* Kết quả thanh toán admin (không cần quyền) */}
          <Route path="/admin/payment-success" element={wrapWithDelay(<PaymentSuccessCashier />)} />
          <Route path="/admin/payment-cancel" element={wrapWithDelay(<PaymentCancelCashier />)} />
        </Routes>
      </AuthAdminProvider>


      {/* ToastContainer để hiển thị thông báo */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
};

export default App;
