
import toast from "react-hot-toast";
import { CircleAlert, CircleCheck, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const baseStyles =
  "max-w-xs w-full shadow-lg rounded-xl pointer-events-auto  flex bg-blue-50 text-gray-800 ";

const getToastColors = (type) => {
  switch (type) {
    case "success":
      return {
        bg: "",
        text: "",
        icon: " text-blue-50 fill-black",
      };
    case "error":
      return {
        bg: "",
        text: "",
        icon: "text-blue-50 fill-black",
      };
    case "loading":
      return {
        bg: "",
        text: "",
        icon: "",
      };
  }
};

const ToastBody = (
  t,
  type,
  message,
  withClose
) => {
  const { bg, text, icon } = getToastColors(type);

  return (
    <div
      className={cn(
        baseStyles,
        t.visible ? "animate-toast-enter" : "animate-toast-leave",
        bg,
        "relative" // add this so absolute positioning works
      )}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex gap-3 items-center">
          <div className="pt-0.5 text-xl transition-transform duration-300">
            {type === "success" && (
              <CircleCheck className={cn("w-6 h-6", icon)} />
            )}
            {type === "error" && (
              <CircleAlert className={cn("w-6 h-6", icon)} />
            )}
            {type === "loading" && (
              <Loader2 className={cn("w-6 h-6", icon, "animate-spin")} />
            )}
          </div>
          <div className="flex-1">
            <p className={cn("text-sm font-medium", text)}>{message}</p>
          </div>
        </div>
      </div>
      {withClose && (
        <button
          onClick={() => toast.dismiss(t.id)}
          className="absolute -top-2 -left-2 bg-black rounded-full shadow p-1 text-white transition"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5 " />
        </button>
      )}
    </div>
  );
};

export const customToast = {
  success: (msg) =>
    toast.custom((t) => ToastBody(t, "success", msg, true), { duration: 3000 }),
  error: (msg) =>
    toast.custom((t) => ToastBody(t, "error", msg, true), { duration: 3000 }),
  loading: (msg) =>
    toast.custom((t) => ToastBody(t, "loading", msg, false),{duration:Infinity}),
  dismiss: toast.dismiss,
};


