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
const client = "/haiha";
const App = () => {
  return (

    <Router>

      {/* Route dành cho khách hàng */}
      <Routes>
        <Route path="/haiha" element={<HomeClient />} >
        </Route>

        <Route path="/haiha/login" element={<LoginClient />} />
        <Route path="/haiha/product/:id" element={<ProductDetail />} />
        <Route path="/haiha/orders" element={<OrderPage />} />
        <Route path="/haiha/payment-success" element={<PaymentSuccess />} />

        <Route path="/haiha/tracking-order" element={<TrackOrder />} />
        <Route path="/haiha/tracking-order/:id" element={<TrackOrderDetail />} />
      </Routes>

      <AuthAdminProvider>
        <Routes>
          {/* Route chỉ dành cho Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }>
            <Route path="/admin/change-password" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                <ChangePassword />
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/commodities" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                <CommodityComponent />
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/options" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                <OptionComponent />
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/options/:id" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                <OptionValueComponent />
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/products" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                <ProductComponent />
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/products/create" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                <InsertProduct />
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/products/edit/:id" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                <UpdateProduct />
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/suppliers" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                <SupplierComponent />
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/promotions" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                <PromotionComponent />
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/vouchers" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                <VoucherManagement />
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/promotions/add-for-variant/:id" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                <AddPromotionVariant />
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/variants" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                <VariantManager />
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/variants/create" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                <InsertVariant />
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/variants/edit/:id" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                <UpdateVariant />
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/user-management" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                <UserManagement />
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/authorization-user" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                <AuthorizationUser />
              </ProtectedAdminRoute>
            } />

            <Route path="/admin/profile" element={
              <ProtectedAdminRoute allowedRoles={["ROLE_ADMIN", "ROLE_USER"]}>
                <SelfEdit />
              </ProtectedAdminRoute>
            } />

          </Route>

          <Route path="/admin/login" element={<LoginAdmin />} />
          <Route path="/admin/forbidden" element={<ForbiddenPage />} />
          {/* <Route path="*" element={<NotFoundPage />} /> */}
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
