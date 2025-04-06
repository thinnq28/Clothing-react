import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faSearch,
  faUser,
  faCogs,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { UserDataResponse } from "../responses/user/user.data.response";
import userService from "../services/userService";
import tokenService from "../services/tokenService";
import { toast } from "react-toastify";
import { FaUser } from "react-icons/fa";

const Sidebar: React.FC = () => {
  const [userDataResponse, setUserDataResponse] = useState<UserDataResponse | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    userService.getUserDetail()
      .then(result => {
        if (result.status != "OK") {
          toast.error(result.message);
        } else {
          setUserDataResponse(result.data);
        }
      })
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const redirectToLogin = () => {
    navigate("/admin/login");
  };

  const showProfile = () => {
    setIsDropdownOpen(false);
    navigate("/admin/profile");
  };

  const changePassword = () => {
    setIsDropdownOpen(false);
    navigate("/admin/change-password");
  };

  const signOut = () => {
    tokenService.removeToken();
    setUserDataResponse(null);
    setIsDropdownOpen(false);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRoles');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminRoles');
    navigate("/admin/login");
  };

  return (
    <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 shadow">
      <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
        <FontAwesomeIcon icon={faBars} />
      </button>

      <form className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
        <div className="input-group">
          <input type="text" className="form-control bg-light border-0 small" placeholder="Search for..." />
          <div className="input-group-append">
            <button className="btn btn-primary" type="button">
              <FontAwesomeIcon icon={faSearch} className="fa-sm" />
            </button>
          </div>
        </div>
      </form>

      <ul className="navbar-nav ml-auto" style={{ marginRight: "1rem" }}>
        <div className="topbar-divider d-none d-sm-block" />
        <li className="nav-item dropdown no-arrow">
          {userDataResponse ? (
            <div className="nav-link dropdown-toggle cursor-pointer" onClick={toggleDropdown}>
              <span className="mr-2 d-none d-lg-inline text-gray-600 small">
                {userDataResponse.fullname}
              </span>
              <FaUser />
            </div>
          ) : (
            <Link to="/login" className="nav-link" onClick={redirectToLogin}>
              <span className="mr-2 d-none d-lg-inline text-gray-600 small">Login</span>
              <img className="img-profile rounded-circle" src="assets/img/undraw_profile.svg" alt="User" />
            </Link>
          )}

          {isDropdownOpen && (
            <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in show">
              <button className="dropdown-item" onClick={showProfile}>
                <FontAwesomeIcon icon={faUser} className="fa-sm fa-fw mr-2 text-gray-400" />
                Profile
              </button>
              <button className="dropdown-item" onClick={changePassword}>
                <FontAwesomeIcon icon={faCogs} className="fa-sm fa-fw mr-2 text-gray-400" />
                Change Password
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={signOut}>
                <FontAwesomeIcon icon={faSignOutAlt} className="fa-sm fa-fw mr-2 text-gray-400" />
                Logout
              </button>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
