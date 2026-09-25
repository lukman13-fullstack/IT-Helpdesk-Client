import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setAuthUserActionCreator } from "@/store/authUser/action";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * MagicLink Auto-Login Page
 * Validates magic token and auto-logs in the user
 *
 * States:
 * - loading: Verifying magic token
 * - success: Token valid, approval pending → redirect to target
 * - already_processed: Token valid but approval already done → show info message
 * - error: Token invalid/expired → show error
 */
export default function MagicLink() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState<
    "loading" | "success" | "already_processed" | "error"
  >("loading");
  const [message, setMessage] = useState("Verifying link...");
  const [targetUrl, setTargetUrl] = useState<string | null>(null);

  // Prevent double validation in React StrictMode
  const hasValidated = useRef(false);

  useEffect(() => {
    // If already validated, skip
    if (hasValidated.current) return;

    const validateAndLogin = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid magic link - no token provided");
        return;
      }

      // Mark as validated to prevent double run
      hasValidated.current = true;

      try {
        // Call backend to validate token and get JWT
        const response = await axios.get(`${API_URL}/auth/magic/${token}`);

        if (response.data.success) {
          const {
            accessToken,
            refreshToken,
            targetUrl: responseTargetUrl,
            user,
            alreadyProcessed,
            message: responseMessage,
          } = response.data;

          // Store tokens in localStorage
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("user", JSON.stringify(user));

          // Set auth user in Redux store
          dispatch(setAuthUserActionCreator(user) as any);

          // Store target URL for "View Details" button
          setTargetUrl(responseTargetUrl || "/dashboard");

          if (alreadyProcessed) {
            // Approval already done - show info message
            setStatus("already_processed");
            setMessage(
              responseMessage || "This request has already been processed."
            );
          } else {
            // Approval pending - redirect to target
            setStatus("success");
            setMessage("Login successful! Redirecting...");

            setTimeout(() => {
              navigate(responseTargetUrl || "/dashboard", { replace: true });
            }, 1000);
          }
        } else {
          setStatus("error");
          setMessage("Authentication failed");
        }
      } catch (error: any) {
        setStatus("error");

        // Parse error message from backend
        const errorMessage =
          error.response?.data?.error || "Magic link validation failed";
        const errorCode = error.response?.data?.code;

        // User-friendly error messages
        const errorMessages: Record<string, string> = {
          INVALID_TOKEN: "This magic link is invalid or has expired",
          TOKEN_EXPIRED:
            "This magic link has expired. Please request a new one.",
        };

        setMessage(
          errorCode && errorMessages[errorCode]
            ? errorMessages[errorCode]
            : errorMessage
        );

        console.error("Magic link error:", error);
      }
    };

    validateAndLogin();
  }, [token, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8">
          {/* Icon & Status */}
          <div className="flex flex-col items-center space-y-4">
            {/* Loading State */}
            {status === "loading" && (
              <>
                <div className="relative">
                  <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
                  <div className="absolute inset-0 h-16 w-16 rounded-full bg-blue-100 opacity-20 animate-ping" />
                </div>
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Authenticating...
                  </h2>
                  <p className="text-gray-600">{message}</p>
                </div>
              </>
            )}

            {/* Success State - Redirect */}
            {status === "success" && (
              <>
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <div className="absolute inset-0 h-16 w-16 rounded-full bg-green-200 opacity-30 animate-ping" />
                </div>
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold text-green-800">
                    ✅ Success!
                  </h2>
                  <p className="text-gray-600">{message}</p>
                </div>
              </>
            )}

            {/* Already Processed State - Info */}
            {status === "already_processed" && (
              <>
                <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                  <Info className="h-10 w-10 text-amber-600" />
                </div>
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold text-amber-800">
                    Already Processed
                  </h2>
                  <p className="text-gray-600">{message}</p>
                </div>
                <div className="w-full pt-4 space-y-2">
                  <button
                    onClick={() =>
                      navigate(targetUrl || "/dashboard", { replace: true })
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => navigate("/dashboard", { replace: true })}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </>
            )}

            {/* Error State */}
            {status === "error" && (
              <>
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold text-red-800">
                    ❌ Authentication Failed
                  </h2>
                  <p className="text-gray-600">{message}</p>
                </div>
                <div className="w-full pt-4 space-y-2">
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Go to Login Page
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    If you continue having issues, please contact support
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              IT Helpdesk System
              <br />© {new Date().getFullYear()} PT Toyo Ink Indonesia
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
