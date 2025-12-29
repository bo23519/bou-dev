"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { LikeButton } from "../likeButton/LikeButton";

export const NavBar = () => {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY;
    if (latest > previous && latest > 100) {
      // Scrolling down and past 100px - hide nav
      setHidden(true);
    } else {
      // Scrolling up - show nav
      setHidden(false);
    }
    setLastScrollY(latest);
  });

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/learning", label: "Learning" },
    { href: "/blog", label: "Blog" },
  ];

  return (
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
              <Link
                key={link.href}
                href={link.href}
                className={`text-white text-sm font-medium transition-colors hover:text-indigo-300 ${
                  pathname === link.href ? "text-indigo-300" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button
          <Link
            href="/#projects"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            View Projects
          </Link> */}
        </div>
      </div>
    </motion.nav>
  );
};

