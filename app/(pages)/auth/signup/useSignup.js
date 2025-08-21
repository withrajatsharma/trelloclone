"use client";

import { customToast } from "@/components/CustomToast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";


const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 6,
  PATTERNS: {
    LOWERCASE: /[a-z]/,
    UPPERCASE: /[A-Z]/,
    NUMBER: /\d/,
    SPECIAL_CHAR: /[!@#$%^&*(),.?":{}|<>]/,
  },
} ;

const EMAIL_PATTERN = /\S+@\S+\.\S+/;



export const useSignup = () => {
  const router = useRouter();

  const [errors, setErrors] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    general: "",
  });




  const clearErrors = useCallback(() => {
    setErrors({
      fullName: false,
      email: false,
      password: false,
      confirmPassword: false,
      general: "",
    });
  }, []);

  // signup -----------------------------------------------------------------------------

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const updateFormData = useCallback((field, value) => {
    clearErrors();
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  }, []);

  const handleSignup = useCallback(
    async (e) => {
      e.preventDefault();

      if (isLoading) return;

      const validationErrors = validateForm(formData);
      if (validationErrors.general) {
        setErrors(validationErrors);
        return;
      }

      clearErrors();
      setIsLoading(true);

      try {
        // await new Promise((res) => setTimeout(res, 2000)); // fake login
        // customToast.success("Login successful!");

        // console.log("formData", formData);

        const res = await axios.post("/api/auth/register", formData);

          if (res && res?.data && res?.data?.success) {
          // setUser(res?.data?.user ?? null);
          router.replace("/dashboard");
          customToast.success(
            res?.data?.message || "Account Created successfully."
          );
        } else {
          customToast.error(res?.data?.message || "Failed to create account.");

          setErrors((prev) => ({
            ...prev,
            general: res.data?.message,
          }));
        }

      } catch (error) {
        customToast.error("Please try again. (signup error)");

        setErrors((prev) => ({
          ...prev,
          general: "Please try again. (signup error)",
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [formData, clearErrors]
  );

  // signup -----------------------------------------------------------------------------



  const validateForm = (data) => {
    const errors = {
      fullName: false,
      email: false,
      password: false,
      confirmPassword: false,
      general: "",
    };

    if (!data.fullName.trim()) {
      errors.fullName = true;
      errors.general = "Full name is required.";
      return errors;
    }
    if (!/^[a-zA-Z\s&apos;-]+$/.test(data.fullName)) {
      errors.fullName = true;
      errors.general =
        "Full name can only contain letters, spaces, and hyphens.";
      return errors;
    }
    if (data.fullName.length > 20) {
      errors.fullName = true;
      errors.general = "Full name should be under 20 characters.";
      return errors;
    }

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

    if (data.password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
      errors.password = true;
      errors.general = `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters.`;
      return errors;
    }

    if (!PASSWORD_REQUIREMENTS.PATTERNS.LOWERCASE.test(data.password)) {
      errors.password = true;
      errors.general = "Password must contain a lowercase letter.";
      return errors;
    }

    if (!PASSWORD_REQUIREMENTS.PATTERNS.UPPERCASE.test(data.password)) {
      errors.password = true;
      errors.general = "Password must contain an uppercase letter.";
      return errors;
    }

    if (!PASSWORD_REQUIREMENTS.PATTERNS.NUMBER.test(data.password)) {
      errors.password = true;
      errors.general = "Password must contain a number.";
      return errors;
    }

    if (!PASSWORD_REQUIREMENTS.PATTERNS.SPECIAL_CHAR.test(data.password)) {
      errors.password = true;
      errors.general = "Password must contain a special character.";
      return errors;
    }

    if (!data.confirmPassword.trim()) {
      errors.confirmPassword = true;
      errors.general = "Please confirm your password.";
      return errors;
    }

    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = true;
      errors.general = "Passwords do not match.";
      return errors;
    }

    return errors;
  };

  return {
    formData,
    updateFormData,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleSignup,

    isLoading,
    errors,
  };
};
