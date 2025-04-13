import React, { useEffect, useState } from "react";

interface PageWithDelayProps {
  children: React.ReactNode;
  delay?: number; // thời gian loading, mặc định 2000ms
}

import "./PayWithDelay.css"

const PageWithDelay: React.FC<PageWithDelayProps> = ({ children, delay = 2000 }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return loading ? (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status" />
    </div>
  ) : (
    <>{children}</>
  );
};

export default PageWithDelay;
