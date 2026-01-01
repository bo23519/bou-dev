"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { LikeButton } from "../likeButton/LikeButton";
import { DrawOutlineButton } from "../ui/button";
import { X, Plus } from "lucide-react";

export const NavBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation((api as any).auth.login);
  const logoutMutation = useMutation((api as any).auth.logout);
  const verifyTokenMutation = useMutation((api as any).auth.verifyToken);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/learning", label: "Learning" },
    { href: "/blog", label: "Blog" },
  ];

  // Get the current browsing section
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  useEffect(() => {
    const getCurrentSection = (pathname: string) => {
      const sections = ["/learning", "/blog"];
      setCurrentSection("/");
      for (const section of sections) {
        if (pathname === section || pathname.startsWith(section + "/")) {
          setCurrentSection(section);
          break;
        }
      }
    };
    getCurrentSection(pathname);
  }, [pathname]);

  // Check if the user is logged in and has the admin role
  // For now, only admin can create content
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const result = await verifyTokenMutation({ token });
          if (result?.valid) {
            setIsLoggedIn(true);
            setIsAdmin(result.role === "admin");
          } else {
            setIsLoggedIn(false);
            setIsAdmin(false);
            localStorage.removeItem("authToken");
          }
        } catch (error) {
          // Silently fail - user is not logged in
          setIsLoggedIn(false);
          setIsAdmin(false);
          localStorage.removeItem("authToken");
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };
    checkAuth();
  }, [verifyTokenMutation]);

  // Hide the navbar when the user scrolls down
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY;
    if (latest > previous && latest > 100) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setLastScrollY(latest);
  });

  const handleLogin = async () => {
    try {
      const result = await loginMutation({ username, password });
      localStorage.setItem("authToken", result.token);
      const verifyResult = await verifyTokenMutation({ token: result.token });
      if (verifyResult?.valid) {
        setIsLoggedIn(true);
        setIsAdmin(verifyResult.role === "admin");
      }
      setShowLoginModal(false);
      setUsername("");
      setPassword("");
    } catch (error: any) {
      console.error("Login error:", error);
      alert(error?.message || "Invalid credentials");
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      await logoutMutation({ token });
    }
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="bg-gradient-to-br from-black/50 to-black/20 rounded-t-2xl px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                <span className="text-black font-bold text-lg">BOU</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-8">
              <LikeButton />
              {navLinks.map((link) => (
                <DrawOutlineButton
                  key={link.href}
                  onClick={() => router.push(link.href)}
                  className={currentSection === link.href ? "text-indigo-500 text-lg" : ""}
                >
                  {link.label}
                </DrawOutlineButton>
              ))}
              {isAdmin && (
                <DrawOutlineButton
                  onClick={() => router.push("/create")}
                  className="w-8 h-8 flex items-center justify-center p-0"
                  title="Create Content"
                >
                  <Plus className="w-4 h-4" />
                </DrawOutlineButton>
              )}
              {isLoggedIn ? (
                <DrawOutlineButton onClick={handleLogout}>
                  Logout
                </DrawOutlineButton>
              ) : (
                <DrawOutlineButton onClick={() => setShowLoginModal(true)}>
                  Login
                </DrawOutlineButton>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 rounded-lg p-6 w-full max-w-md mx-4 border border-zinc-800"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Login</h2>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && username && password) {
                        handleLogin();
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && username && password) {
                        handleLogin();
                      }
                    }}
                  />
                </div>
                <button
                  onClick={handleLogin}
                  disabled={!username || !password}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-white-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  Login
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

