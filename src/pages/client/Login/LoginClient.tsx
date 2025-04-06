import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import ClientService from "../../../services/ClientService";
import { UserDataResponse } from "../../../responses/user/user.data.response";
import { LoginDTO } from "../../../dtos/user/login.dto";
import { toast } from "react-toastify";

const LoginClient: React.FC = () => {
    const navigate = useNavigate();

    const [phoneNumber, setPhoneNumber] = useState("1122334455");
    const [password, setPassword] = useState("123456");
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async () => {
        const loginDTO: LoginDTO = { phoneNumber, password };

        try {
            await ClientService.login(loginDTO)
                .then(response => response.data)
                .then(result => {
                    if (result.status != "OK") {
                        toast.error(result.message);
                        if (Array.isArray(result.data)) {
                            result.data.forEach((msg: string) => toast.error(msg));
                        }
                    } else {
                        toast.success(result.message);
                        if (rememberMe) {
                            // Lưu token và roles vào localStorage hoặc state
                            localStorage.setItem("clientToken", result.data.token);
                            localStorage.setItem("clientRoles", JSON.stringify(result.data.roles));
                            window.location.href = "/haiha"
                        } else {
                            // Lưu token và roles vào localStorage hoặc state
                            sessionStorage.setItem("clientToken", result.data.token);
                            sessionStorage.setItem("clientRoles", JSON.stringify(result.data.roles));
                            window.location.href = "/haiha"
                        }
                    }
                })
                .catch(error => {
                    toast.error(error.message);
                })
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Lỗi không xác định";
            toast.error(errorMessage);
        }
    };

    return (
        <>
            <div className="container font">
                <div className="row justify-content-center">
                    <div className="col-xl-10 col-lg-12 col-md-9" style={{width: "1000px"}}>
                        <div className="card o-hidden border-0 shadow-lg my-5">
                            <div className="card-body p-0">
                                <div className="row">
                                    <div className="col-lg-6 d-none d-lg-block bg-login-image"></div>
                                    <div className="col-lg-6">
                                        <div className="p-5">
                                            <div className="text-center">
                                                <h1 className="h4 text-gray-900 mb-4">Welcome Back!</h1>
                                            </div>
                                            <form className="user" onSubmit={(e) => e.preventDefault()}>
                                                <div className="form-group">
                                                    <input
                                                        style={{fontSize: "1rem"}}
                                                        type="text"
                                                        className="form-control form-control-user"
                                                        placeholder="Enter Phone number..."
                                                        value={phoneNumber}
                                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <input
                                                        style={{fontSize: "1rem"}}
                                                        type="password"
                                                        className="form-control form-control-user"
                                                        placeholder="Password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                </div>
                                                <div className="form-group custom-control custom-checkbox small">
                                                    <input
                                                        type="checkbox"
                                                        className="custom-control-input"
                                                        id="customCheck"
                                                        checked={rememberMe}
                                                        onChange={(e) => setRememberMe(e.target.checked)}
                                                    />
                                                    <label className="custom-control-label" htmlFor="customCheck">
                                                        Remember Me
                                                    </label>
                                                </div>
                                                <Button label="Login" onClick={handleLogin} className="btn btn-primary btn-block" />
                                                <hr />
                                                <a href="#" className="btn btn-google btn-user btn-block">
                                                    <i className="fab fa-google fa-fw"></i> Login with Google
                                                </a>
                                                <a href="#" className="btn btn-facebook btn-user btn-block">
                                                    <i className="fab fa-facebook-f fa-fw"></i> Login with Facebook
                                                </a>
                                            </form>
                                            <hr />
                                            <div className="text-center">
                                                <a className="small" href="/forgot-password">Forgot Password?</a>
                                            </div>
                                            <div className="text-center">
                                                <a className="small" href="/register">Create an Account!</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginClient;
