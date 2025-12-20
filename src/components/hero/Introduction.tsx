"use client";

import React from "react";
import { motion } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";

export const Introduction = () => {
    const links = useQuery(api.links.getLinks);

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

                    {/* CTA Button */}
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

                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                navigator.clipboard.writeText(links?.Email?.url ?? "");
                            }}
                            className="mt-8 w-fit rounded-lg bg-[#6366F1] px-4 py-2 text-lg font-bold text-white shadow-lg shadow-indigo-500/20 transition-colors hover:bg-[#5850EC]"
                        >
                            Email
                        </motion.a>
                    </motion.div>
                </motion.div>
            </div>
        </section >
    );
};
