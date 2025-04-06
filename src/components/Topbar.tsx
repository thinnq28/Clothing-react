import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLaughWink,
  faTachometerAlt,
  faFileInvoice,
  faVolcano,
  faTicket,
  faTruckField,
  faTableColumns,
  faUsers,
  faPeopleGroup,
} from "@fortawesome/free-solid-svg-icons";
import { faOptinMonster, faPaypal, faProductHunt } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";

const Topbar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
      <ul className={`navbar-nav bg-gradient-primary sidebar sidebar-dark accordion ${isCollapsed ? "toggled" : ""}`} id="accordionSidebar">
        {/* Sidebar - Brand */}
        <Link className="sidebar-brand d-flex align-items-center justify-content-center" to="/admin">
          <div className="sidebar-brand-icon rotate-n-15">
            <FontAwesomeIcon icon={faLaughWink} />
          </div>
          <div className="sidebar-brand-text mx-3">Shop Admin</div>
        </Link>

        {/* Divider */}
        <hr className="sidebar-divider my-0" />

        {/* Nav Item - Dashboard */}
        <li className="nav-item active">
          <Link className="nav-link" to="/admin">
            <FontAwesomeIcon icon={faTachometerAlt} className="fa-fw" />
            <span>Dashboard</span>
          </Link>
        </li>

        {/* Divider */}
        <hr className="sidebar-divider" />

        {/* Heading */}
        <div className="sidebar-heading">Interface</div>

        <li className="nav-item">
          <Link className="nav-link" to="/admin/products">
            <FontAwesomeIcon icon={faProductHunt} />
            <span>Products</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/admin/orders">
            <FontAwesomeIcon icon={faFileInvoice} />
            <span>Orders</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/admin/purchase-orders">
            <FontAwesomeIcon icon={faFileInvoice} />
            <span>Purchase Orders</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/admin/variants">
            <FontAwesomeIcon icon={faVolcano} />
            <span>Variants</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/admin/promotions">
            <FontAwesomeIcon icon={faPaypal} />
            <span>Promotions</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/admin/vouchers">
            <FontAwesomeIcon icon={faTicket} />
            <span>Vouchers</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/admin/suppliers">
            <FontAwesomeIcon icon={faTruckField} />
            <span>Suppliers</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/admin/commodities">
            <FontAwesomeIcon icon={faTableColumns} />
            <span>Commodities</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/admin/options">
            <FontAwesomeIcon icon={faOptinMonster} />
            <span>Options</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/admin/user-management">
            <FontAwesomeIcon icon={faUsers} />
            <span>Users</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link className="nav-link" to="/admin/authorization-user">
            <FontAwesomeIcon icon={faPeopleGroup} />
            <span>Team members</span>
          </Link>
        </li>

        {/* Divider */}
        <hr className="sidebar-divider d-none d-md-block" />

        {/* Sidebar Toggler (Sidebar) */}
        <div className="text-center d-none d-md-inline">
          <button className="rounded-circle border-0" id="sidebarToggle" onClick={toggleSidebar}></button>
        </div>
      </ul>
  );
};

export default Topbar;