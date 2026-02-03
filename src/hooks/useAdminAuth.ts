import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface UseAdminAuthOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

export function useAdminAuth(options: UseAdminAuthOptions = {}) {
  const { redirectTo, requireAuth = true } = options;
  const router = useRouter();
  const verifyTokenMutation = useMutation(api.system.auth.verifyToken);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const result = await verifyTokenMutation({ token });
          if (result?.valid && result.role === "admin") {
            setIsAdmin(true);
            setIsLoading(false);
          } else {
            // Token invalid or not admin
            console.warn("Authentication failed: Invalid token or insufficient permissions");
            localStorage.removeItem("authToken"); // Clean up invalid token
            setIsAdmin(false);
            setIsLoading(false);
            if (requireAuth && redirectTo) {
              alert("⚠️ Your session has expired or you don't have permission. Please log in again.");
              router.push(redirectTo);
            }
          }
        } catch (error: any) {
          // Token verification error
          console.error("Authentication error:", error);
          localStorage.removeItem("authToken"); // Clean up invalid token
          setIsAdmin(false);
          setIsLoading(false);
          if (requireAuth && redirectTo) {
            const errorMessage = error?.message || "Authentication failed";
            if (errorMessage.includes("expired")) {
              alert("⚠️ Your session has expired. Please log in again.");
            } else {
              alert("⚠️ Authentication error. Please log in again.");
            }
            router.push(redirectTo);
          }
        }
      } else {
        // No token found
        setIsAdmin(false);
        setIsLoading(false);
        if (requireAuth && redirectTo) {
          console.warn("No authentication token found");
          router.push(redirectTo);
        }
      }
    };
    checkAuth();
  }, [verifyTokenMutation, router, redirectTo, requireAuth]);

  return { isAdmin, isLoading };
}
