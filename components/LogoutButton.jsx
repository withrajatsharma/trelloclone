"use client";
import React from "react";
import { customToast } from "@/components/CustomToast";
import LoadingButton from "@/components/LoadingButton";
import { useRouter } from "next/navigation";
import axios from "axios";

const LogoutButton = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    const loadingToast = customToast.loading("Logging out...");
    try {
      const res = await axios.post("/api/auth/logout");
      if (res.data.success) {
        router.replace("/auth/login");
        customToast.success(res?.data?.message || "Logged out successfully.");
      } else {
        customToast.error(res?.data?.message || "Failed to logout.");
      }
    } catch (error) {
      console.log(`Error during logout:`, error?.message);
      console.log(`error :`, error?.response);
      customToast.error(
        error?.response?.data?.message || "Please try again. (logout error)"
      );
    } finally {
      customToast.dismiss(loadingToast);
      setIsLoading(false);
    }
  };

  return (
    <LoadingButton
      isLoading={isLoading}
      loadingText={"logging out..."}
      onClick={handleLogout}
      className={"w-fit"}
    >
      Logout
    </LoadingButton>
  );
};

export default LogoutButton;
