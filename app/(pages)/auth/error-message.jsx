"use client";

import React from "react";

const ErrorMessage = ({ message }) => {
  if (!message) return null;

  if (
    message === "Password reset successfully." ||
    message === "OTP resent successfully."
  ) {
    return (
      <div
        className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 text-[14px] rounded"
        role="alert"
        aria-live="polite"
      >
        {message}
      </div>
    );
  }

  return (
    <div
      className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-[14px] rounded"
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
};

export default ErrorMessage;
