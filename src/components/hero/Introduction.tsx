"use client";

import React, { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { ReactLenis } from "lenis/react";
import {
    motion,
    AnimatePresence,
    useMotionTemplate,
    useScroll,
    useTransform,
} from "framer-motion";
import { SiSpacex } from "react-icons/si";
import { FiArrowRight, FiMapPin } from "react-icons/fi";
import { useRef } from "react";

export const Introduction = () => {
    const links = useQuery(api.links.getLinks);

    // Local state to track if the tooltip is visible
    const [showCopied, setShowCopied] = useState(false);

    const handleEmailClick = () => {
        // Copy email to clipboard
        navigator.clipboard.writeText(links?.Email?.url ?? "");

        // Show the tooltip
        setShowCopied(true);

        // Hide it after 2 seconds
        setTimeout(() => {
            setShowCopied(false);
        }, 1000);
    };
    const ref = useRef(null);
    // test
    const start = 200;
    const end = 0;

    const { scrollYProgress } = useScroll({
        target: ref,
        // @ts-ignore
        offset: [`${start}px end`, `end ${end * -1}px`],
    });

    const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);
    const scale = useTransform(scrollYProgress, [0.75, 1], [1, 0.85]);

    const y = useTransform(scrollYProgress, [0, 1], [start, end]);
    const transform = useMotionTemplate`translateY(${y}px) scale(${scale})`;


    const style = { transform, opacity };

    return (
        <section className="relative w-full bg-[#0B1120] px-8 py-24 md:py-32 overflow-hidden rounded-3xl">
            {/* Background Dot Pattern */}
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none">
                <div
                    className="h-full w-full"
                    style={{
                        backgroundImage: "radial-gradient(#94A3B8 1px, transparent 1px)",
                        backgroundSize: "24px 24px"
                    }}
                />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    ref={ref}
                    style={{ transform, opacity }}
                    viewport={{ once: true }}
                    className="flex flex-col gap-6"
                >
                    {/* Main Heading */}
                    <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white font-inter">
                        Hi, I'm <span className="text-white">Baian Ou</span>
                        <span className="text-[#6366F1]">.</span>
                    </h1>

                    {/* Subheading */}
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#94A3B8]">
                        I'm a <span className="text-[#6366F1]">Software Engineer</span><br />
                        <span className="text-2xl md:text-4xl text-[#94A3B8]/80">
                            Focused on Backend & Data Systems.
                        </span>
                    </h2>

                    {/* Description */}
                    <p className="max-w-2xl text-lg md:text-xl leading-relaxed text-[#B5B5B5] font-medium mt-4">
                        2 years as a <span className="text-[#6366F1]">Data Engineer</span> in Mastercard. <br />
                        Recent <span className="text-[#6366F1]">MSCS Graduate</span> from Brown University. <br />
                        Working on <span className="text-[#6366F1]">Full-stack/Backend</span> dev. <br /><br />
                        If you are interested in learning more, let's connect!
                    </p>

                    {/* CTA Buttons */}
                    <motion.div className="flex gap-4">
                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={links?.Resume?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-8 w-fit rounded-lg bg-[#6366F1] px-4 py-2 text-lg font-bold text-white shadow-lg shadow-indigo-500/20 transition-colors hover:bg-[#5850EC]"
                        >
                            Resume
                        </motion.a>

                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={links?.LinkedIn?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-8 w-fit rounded-lg bg-[#6366F1] px-4 py-2 text-lg font-bold text-white shadow-lg shadow-indigo-500/20 transition-colors hover:bg-[#5850EC]"
                        >
                            LinkedIn
                        </motion.a>

                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={links?.GitHub?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-8 w-fit rounded-lg bg-[#6366F1] px-4 py-2 text-lg font-bold text-white shadow-lg shadow-indigo-500/20 transition-colors hover:bg-[#5850EC]"
                        >
                            GitHub
                        </motion.a>

                        {/* Email button with tooltip */}
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleEmailClick}
                                className="mt-8 w-fit rounded-lg bg-[#6366F1] px-4 py-2 text-lg font-bold text-white shadow-lg shadow-indigo-500/20 transition-colors hover:bg-[#5850EC] cursor-pointer"
                            >
                                Email
                            </motion.button>

                            {/* Tooltip popup */}
                            <AnimatePresence>
                                {showCopied && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute -top-2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-md whitespace-nowrap"
                                    >
                                        Copied!
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section >
    );
};
