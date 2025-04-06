import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CommodityDataResponse } from '../../../responses/commodity/Commodity.data.response';
import { UserDataResponse } from '../../../responses/user/user.data.response';
import commodityService from '../../../services/CommodityService';
import ClientService from '../../../services/ClientService';
import tokenService from '../../../services/tokenService';
import axios from 'axios';
import { environment } from '../../../environment/environment';
import { toast } from 'react-toastify';

const Header: React.FC = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isInventoryDropdownOpen, setIsInventoryDropdownOpen] = useState(false);
    const [commodities, setCommodities] = useState<CommodityDataResponse[]>([]);

    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isLogin = localStorage.getItem('clientToken') || sessionStorage.getItem('clientToken');

    useEffect(() => {
        getCommodities('');
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);

        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const getCommodities = async (name: string) => {
        try {
            const response = await axios.get(`${environment.apiBaseUrl}/client/commodity`);
            const { data, status } = response;

            if (status != 200) {
                toast.error(data.message || "Lỗi không xác định khi lấy danh sách sản phẩm");
                if (Array.isArray(data)) {
                    data.forEach((msg: string) => toast.error(msg));
                }
                return;
            }
            setCommodities(data.data);
        } catch (error: any) {
            toast.error("Không thể tải danh sách sản phẩm");
            console.error("Error fetching commodity:", error);
        }
    };

    const signOut = () => {
        localStorage.removeItem("clientToken");
        sessionStorage.removeItem("clientToken");
        localStorage.removeItem("clientRoles");
        sessionStorage.removeItem("clientRoles");
        navigate('/haiha')
    };

    return (
        <header className="p-3 mb-3 border-bottom">
            <div className="container">
                <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                    <Link to="/" className="d-flex align-items-center mb-2 mb-lg-0 text-dark text-decoration-none">
                        <i className="fa-solid fa-shop"></i>
                    </Link>

                    <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
                        <li><Link to="/haiha" className="nav-link px-2 link-secondary track-order">Trang chủ</Link></li>

                        <li className="nav-item dropdown">
                            <a href="#" className="nav-link px-2 link-dark dropdown-toggle" onClick={(e) => {
                                e.preventDefault();
                                setIsInventoryDropdownOpen(prev => !prev);
                            }}>
                                Loại Sản Phẩm
                            </a>
                            <ul className={`dropdown-menu text-small ${isInventoryDropdownOpen ? 'show' : ''}`}>
                                {commodities.map((commodity, index) => (
                                    <li key={index}>
                                        <Link className="dropdown-item" to={`/commodity/${commodity.commodityName}`}>
                                            {commodity.commodityName}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </li>

                        <li><a href="#" className="nav-link px-2 link-dark">Sell Off</a></li>
                        <li><a href="#" className="nav-link px-2 link-dark">Tin hot</a></li>
                        <li><Link to="/haiha/orders" className="nav-link px-2 link-dark">Giỏ hàng</Link></li>
                    </ul>

                    {/* <form className="d-flex col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3" onSubmit={e => { e.preventDefault(); search(); }}>
                        <input
                            className="form-control me-2"
                            type="text"
                            placeholder="Tên sản phẩm"
                            aria-label="Search"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                        />
                        <button className="btn btn-outline-dark" type="button" onClick={search}>Tìm</button>
                    </form> */}

                    {isLogin ? (
                        <div className="dropdown text-end" ref={dropdownRef}>
                            <a href="#" className="d-block link-dark text-decoration-none dropdown-toggle" onClick={(e) => {
                                e.preventDefault();
                                setIsDropdownOpen(prev => !prev);
                            }}>
                                <img src="https://github.com/mdo.png" alt="user" width="32" height="32" className="rounded-circle" />
                            </a>
                            <ul className={`dropdown-menu text-small ${isDropdownOpen ? 'show' : ''}`}>
                                <li><Link className="dropdown-item" to="/haiha/tracking-order">Đơn hàng</Link></li>
                                <li><Link className="dropdown-item" to="/haiha/change-password">Đổi mật khẩu</Link></li>
                                <li><Link className="dropdown-item" to="/haiha/profile">Thông tin</Link></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><a className="dropdown-item" onClick={signOut}>Đăng xuất</a></li>
                            </ul>
                        </div>
                    ) : (
                        <>
                            <button type="button" className="btn btn-link" onClick={() => navigate('/haiha/login')}>Đăng nhập</button>
                            <button type="button" className="btn btn-link" onClick={() => navigate('/haiha/register')}>Đăng ký</button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
