import React, { useState } from "react";
import useFetchWithAuth from "../../../fetch/FetchAdmin"; // Import hook
import "./ChangePassword.css";
import { toast } from "react-toastify";

const ChangePassword: React.FC = () => {
  const fetchWithAuth = useFetchWithAuth();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let valid = true;
    let newErrors = { currentPassword: "", newPassword: "", confirmPassword: "" };

    if (form.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu ít nhất 6 ký tự.";
      valid = false;
    }
    if (form.confirmPassword !== form.newPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp.";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setMessage(null);

    try {
      await fetchWithAuth("/users/admin/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword
        }),
      }).then(result => {
        if (result.status != "OK") {
          toast.error(result.message); 
          if (Array.isArray(result.data)) {
            result.data.forEach((msg: string) => toast.error(msg));
          }
        } else {
          setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
          toast.success(result.message)
        }
      }).catch(error => {
        toast.error("Đổi mật khẩu thất bại! Vui lòng kiểm tra lại.");
        console.error("Error changing password:", error);
      })

    } catch (error) {
      setMessage("Đổi mật khẩu thất bại! Vui lòng kiểm tra lại.");
      console.error("Error changing password:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mainDiv">
      <div className="cardStyle">
        <form>


          <h2 className="formTitle">Change Your Password</h2>

          {message && <div className="message">{message}</div>}

          <div className="inputDiv">
            <label className="inputLabel" htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              className={errors.currentPassword ? "is-invalid" : ""}
              value={form.currentPassword}
              onChange={handleChange}
              required
            />
            {errors.currentPassword && <div className="invalid-feedback">{errors.currentPassword}</div>}
          </div>

          <div className="inputDiv">
            <label className="inputLabel" htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className={errors.newPassword ? "is-invalid" : ""}
              value={form.newPassword}
              onChange={handleChange}
              required
            />
            {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
          </div>

          <div className="inputDiv">
            <label className="inputLabel" htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={errors.confirmPassword ? "is-invalid" : ""}
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
          </div>

          <div className="buttonWrapper">
            <button
              type="button"
              onClick={handleSubmit}
              id="submitButton"
              className="submitButton"
              disabled={loading}
            >
              <span>{loading ? "Processing..." : "Change Password"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
