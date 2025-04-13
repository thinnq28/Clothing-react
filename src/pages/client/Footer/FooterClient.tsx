import React, { useState } from 'react';
import "./FooterClient.css";
import { FaFacebook, FaGit, FaInstagram, FaYoutube } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (phoneNumber.trim()) {
      window.location.href = `/haiha/tracking-order/phone-number/${phoneNumber}`;
    }
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-6">
            <h6>About</h6>
            <p className="text-justify">
              <strong>HaiHa</strong> là cửa hàng thời trang trực tuyến chuyên cung cấp các sản phẩm quần áo chất lượng cao với mẫu mã đa dạng, phù hợp với mọi phong cách và xu hướng hiện đại.
              Chúng tôi cam kết mang đến trải nghiệm mua sắm dễ dàng, nhanh chóng và uy tín cho khách hàng trên toàn quốc. Tại HaiHa, mỗi sản phẩm không chỉ là thời trang mà còn là cách bạn thể hiện cá tính và phong cách sống.
            </p>
          </div>

          <div className="col-xs-6 col-md-3">
            <h6>Tra cứu đơn hàng</h6>
            <div className="footer-search-order">
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Nhập số điện thoại"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <button className="btn btn-primary w-100" onClick={handleSearch}>
                Tìm đơn hàng
              </button>
            </div>
          </div>

          <div className="col-xs-6 col-md-3">
            <h6>Quick Links</h6>
            <ul className="footer-links">
              <li><a href="https://www.facebook.com/SVCGHaiHa">Về chúng tôi</a></li>
              <li><a href="https://www.facebook.com/thinnqfpt">Liên hệ</a></li>
              <li><Link to={"/haiha/orders"}>Giỏ hàng</Link></li>
              <li><Link to={"/haiha/your-profile"}>Thông tin cá nhân</Link></li>
            </ul>
          </div>
        </div>
        <hr />
      </div>

      <div className="container">
        <div className="row">
          <div className="col-md-8 col-sm-6 col-xs-12">
            <p className="copyright-text">
              Copyright &copy; 2025 All Rights Reserved by <a href="#">ThinNQ</a>.
            </p>
          </div>

          <div className="col-md-4 col-sm-6 col-xs-12">
            <ul className="social-icons">
              <li><a className="facebook" href="#"><FaFacebook /></a></li>
              <li><a className="twitter" href="#"><FaInstagram /></a></li>
              <li><a className="dribbble" href="#"><FaYoutube /> </a></li>
              <li><a className="linkedin" href="#"><FaGit /></a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
