"use client";

import { customToast } from "@/components/CustomToast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";


const EMAIL_PATTERN = /\S+@\S+\.\S+/;
const OTP_PATTERN = /^\d*$/;

const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 6,
  PATTERNS: {
    LOWERCASE: /[a-z]/,
    UPPERCASE: /[A-Z]/,
    NUMBER: /\d/,
    SPECIAL_CHAR: /[!@#$%^&*(),.?":{}|<>]/,
  },
} ;

export const useLogin = () => {
  const router = useRouter();

  const [errors, setErrors] = useState({
    email: false,
    password: false,
    general: "",
  });


  const clearErrors = useCallback(() => {
    setErrors({
      email: false,
      password: false,
      general: "",
    });
  }, []);


  // login -----------------------------------------------------------------------------

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = useCallback(
    (field, value) => {
      clearErrors();
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: false }));
      }
    },
    [errors, clearErrors]
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    const validationErrors = validateLoginForm(formData);
    if (validationErrors.general) {
      setErrors(validationErrors);
      return;
    }
    clearErrors();
    setIsLoading(true);
    try {
      // await new Promise((res) => setTimeout(res, 2000)); // fake login
      // alert("Login successful!");

      const res = await axios.post("/api/auth/login", formData);

      if (res && res?.data && res?.data?.success) {
        router.replace("/dashboard");
        customToast.success(res?.data?.message || "Login successful.");
      } else {
        customToast.error(
          res?.data?.message || "Login failed. Please try again."
        );

        setErrors((prev) => ({
          ...prev,
          general: res?.data?.message,
        }));
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: "Login failed. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };


  // login -----------------------------------------------------------------------------


  const validateLoginForm = (data) => {
    const errors = {
      email: false,
      password: false,
      general: "",
    };

    if (!data.email.trim()) {
      errors.email = true;
      errors.general = "Email is required.";
      return errors;
    }

    if (!EMAIL_PATTERN.test(data.email)) {
      errors.email = true;
      errors.general = "Enter a valid email.";
      return errors;
    }

    if (!data.password.trim()) {
      errors.password = true;
      errors.general = "Password is required.";
      return errors;
    }

    return errors;
  };

 
  return {
    // Login
    formData,
    updateFormData,
    showPassword,
    setShowPassword,
    isLoading,
    handleLogin,

    errors,
  };
};
