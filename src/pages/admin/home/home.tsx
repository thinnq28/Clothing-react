import { Outlet } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";

const AdminDashboard : React.FC = () => {
  return (
    <div id="wrapper">
      <Topbar />
      {/* Nội dung trang Home */}
      <div id="content-wrapper" className="d-flex flex-column">

        <div id="content">
          <Sidebar />

          <div className="contailer-fluid">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
