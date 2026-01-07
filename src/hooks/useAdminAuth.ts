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
            setIsAdmin(false);
            setIsLoading(false);
            if (requireAuth && redirectTo) {
              router.push(redirectTo);
            }
          }
        } catch (error) {
          setIsAdmin(false);
          setIsLoading(false);
          if (requireAuth && redirectTo) {
            router.push(redirectTo);
          }
        }
      } else {
        setIsAdmin(false);
        setIsLoading(false);
        if (requireAuth && redirectTo) {
          router.push(redirectTo);
        }
      }
    };
    checkAuth();
  }, [verifyTokenMutation, router, redirectTo, requireAuth]);

  return { isAdmin, isLoading };
}
