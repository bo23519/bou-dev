"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { LikeButton } from "../likeButton/LikeButton";
import { DrawOutlineButton } from "../ui/button";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFileUpload } from "@/hooks/useFileUpload";
import { AssetUploadModal } from "../admin/AssetUploadModal";

export const NavBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showAssetUploadModal, setShowAssetUploadModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loginMutation = useMutation(api.system.auth.login);
  const logoutMutation = useMutation(api.system.auth.logout);
  const verifyTokenMutation = useMutation(api.system.auth.verifyToken);
  const setAssetMutation = useMutation(api.storage.assets.setAsset);
  const { uploadFile, isUploading } = useFileUpload();

  const assets = useQuery(api.storage.assets.getAssets);
  const iconUrl = assets?.logo?.url;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/commission", label: "Commission" },
    { href: "/blog", label: "Blog" },
  ];

  // Scroll to top when pathname changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCreateDropdown(false);
      }
    };
    if (showCreateDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCreateDropdown]);

  // Get the current browsing section
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  useEffect(() => {
    const getCurrentSection = (pathname: string) => {
      const sections = ["/commission", "/blog"];
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
    if (latest > previous && latest > 75) {
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
          <div className="bg-black/70 backdrop-blur-sm rounded-t-2xl px-4 sm:px-6 py-4 flex items-center justify-between border-b border-white/10">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <div className="w-12 h-12 rounded-sm flex items-center justify-center overflow-hidden">
                {iconUrl ? (
                  <img 
                    src={iconUrl} 
                    alt="Logo" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 animate-pulse" />
                )}
              </div>
            </Link>

            {/* Right side: Navigation Links (swipeable) + Buttons */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* Navigation Links - Swipeable on mobile */}
              <div 
                className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-hide flex-1 min-w-0 max-w-[calc(100vw-200px)] sm:max-w-none sm:overflow-visible" 
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                  <LikeButton />
                  {navLinks.map((link) => {
                    const isActive = currentSection === link.href;
                    return (
                      <button
                        key={link.href}
                        type="button"
                        onClick={() => router.push(link.href)}
                        className={cn(
                          "px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0",
                          isActive
                            ? "text-black breathe"
                            : "text-[#787878] hover:bg-[#D8FA00] hover:text-[#181818]"
                        )}
                      >
                        {link.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {isAdmin && (
                <div className="relative" ref={dropdownRef}>
                  <DrawOutlineButton
                    onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium transition-all duration-300 text-[#787878] hover:text-[#D8FA00]"
                    )}
                    title="Create Content"
                  >
                    <Plus className="w-4 h-4" />
                  </DrawOutlineButton>
                  <AnimatePresence>
                    {showCreateDropdown && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-black border rounded-lg shadow-lg overflow-hidden z-50"
                      >
                        <button
                          onClick={() => {
                            router.push("/blog/create");
                            setShowCreateDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-[#EFF0EF] hover:bg-[#D8FA00] hover:text-[#181818] transition-colors duration-200 flex items-center gap-2"
                        >
                          <span>New Blog Post</span>
                        </button>
                        <button
                          onClick={() => {
                            router.push("/commission/create");
                            setShowCreateDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-[#EFF0EF] hover:bg-[#D8FA00] hover:text-[#181818] transition-colors duration-200 flex items-center gap-2 border-t border-zinc-700"
                        >
                          <span>New Commission</span>
                        </button>
                        <button
                          onClick={() => {
                            router.push("/project/create");
                            setShowCreateDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-[#EFF0EF] hover:bg-[#D8FA00] hover:text-[#181818] transition-colors duration-200 flex items-center gap-2 border-t border-zinc-700"
                        >
                          <span>New Project</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowAssetUploadModal(true);
                            setShowCreateDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-[#EFF0EF] hover:bg-[#D8FA00] hover:text-[#181818] transition-colors duration-200 flex items-center gap-2 border-t border-zinc-700"
                        >
                          <ImageIcon className="w-4 h-4" />
                          <span>Upload Asset</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {isLoggedIn ? (
                <DrawOutlineButton onClick={handleLogout}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all duration-300 text-[#787878] hover:text-[#DB3C30]"
                )}
                color="#DB3C30"
                >
                Logout
                </DrawOutlineButton>
              ) : (
                <DrawOutlineButton 
                onClick={() => setShowLoginModal(true)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all duration-300 text-[#787878] hover:text-[#D8FA00]"
                )}>
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
                <h2 className="text-xl font-bold text-[#EFF0EF]">Login</h2>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-zinc-400 hover:text-[#EFF0EF] transition-colors"
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
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-[var(--zzz-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--zzz-neon-green)]"
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
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-[var(--zzz-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--zzz-neon-green)]"
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
                  className="w-full px-4 py-2 bg-[#D8FA00] hover:bg-[#C8E600] disabled:bg-zinc-700 disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors"
                >
                  Login
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AssetUploadModal
        isOpen={showAssetUploadModal}
        onClose={() => setShowAssetUploadModal(false)}
        onUpload={async (assetKey: string, file: File) => {
          try {
            const storageId = await uploadFile(file);
            await setAssetMutation({
              key: assetKey,
              storageId,
            });
            setShowAssetUploadModal(false);
          } catch (error) {
            console.error("Failed to upload asset:", error);
            alert("Failed to upload asset");
          }
        }}
        isUploading={isUploading}
      />
    </>
  );
};

