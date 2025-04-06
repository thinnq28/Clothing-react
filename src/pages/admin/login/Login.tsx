import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios
import "./Login.css";
import { environment } from "../../../environment/environment";
import { toast } from "react-toastify";

interface LoginDTO {
  phoneNumber: string;
  password: string;
}

const Login: React.FC = () => {
  const { register, handleSubmit } = useForm<LoginDTO>();
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (data: LoginDTO) => {
    try {
      await axios.post(environment.apiBaseUrl + "/users/admin/login", data)
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
              localStorage.setItem("adminToken", result.data.token);
              localStorage.setItem("adminRoles", JSON.stringify(result.data.roles));
              window.location.href = "/admin"
            } else {
              // Lưu token và roles vào localStorage hoặc state
              sessionStorage.setItem("adminToken", result.data.token);
              sessionStorage.setItem("adminRoles", JSON.stringify(result.data.roles));
              window.location.href = "/admin"
            }
          }
        })
        .catch(error => {
          toast.error(error.message);
        })


      // navigate("/dashboard"); // Điều hướng sau khi login thành công
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Login failed! Please try again.");
    }
  };

  return (
    <div className="bg-gradient-primary">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-12 col-md-9">
            <div className="card o-hidden border-0 shadow-lg my-5">
              <div className="card-body p-0">
                <div className="row">
                  <div className="col-lg-6 d-none d-lg-block bg-login-image"></div>
                  <div className="col-lg-6">
                    <div className="p-5">
                      <div className="text-center">
                        <h1 className="h4 text-gray-900 mb-4">Welcome Back!</h1>
                      </div>
                      {errorMessage && (
                        <div className="alert alert-danger" role="alert">
                          {errorMessage}
                        </div>
                      )}
                      <form className="user" onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                          <input
                            type="text"
                            className="form-control form-control-user"
                            placeholder="Enter phone number..."
                            {...register("phoneNumber", { required: true })}
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="password"
                            className="form-control form-control-user"
                            placeholder="Password"
                            {...register("password", { required: true })}
                          />
                        </div>
                        <div className="form-group">
                          <div className="custom-control custom-checkbox small">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id="customCheck"
                              checked={rememberMe}
                              onChange={() => setRememberMe(!rememberMe)}
                            />
                            <label className="custom-control-label" htmlFor="customCheck">
                              Remember Me
                            </label>
                          </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-user btn-block">
                          Login
                        </button>
                      </form>
                      <hr />
                      <div className="text-center">
                        <a className="small" href="/forgot-password">
                          Forgot Password?
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
