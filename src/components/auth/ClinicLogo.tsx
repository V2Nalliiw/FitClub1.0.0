import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLogo from "./AppLogo";

const ClinicLogo: React.FC<{
  size?: "sm" | "md" | "lg";
  type?: "main" | "mobile";
}> = ({ size = "md", type = "mobile" }) => {
  const { user } = useAuth();

  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-14",
  };

  if (user?.clinicLogoUrl) {
    return (
      <img
        src={user.clinicLogoUrl}
        alt="Clinic Logo"
        className={`${sizeClasses[size]} object-contain`}
      />
    );
  }

  return <AppLogo type={type} size={size} />;
};

export default ClinicLogo; 