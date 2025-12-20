"use client";

import React from "react";
import { motion } from "framer-motion";

export const Introduction = () => {
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
                        Hi, I'm <span className="text-white">Bob</span>
                        <span className="text-[#6366F1]">.</span>
                    </h1>

                    {/* Subheading */}
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#94A3B8]">
                        I'm a <span className="text-[#6366F1]">Full Stack Developer</span>
                    </h2>

                    {/* Description */}
                    <p className="max-w-2xl text-lg md:text-xl leading-relaxed text-[#94A3B8] font-medium mt-4">
                        I've spent the last 5 years building and scaling software for some pretty
                        cool companies. I also teach people to paint online (incase you've got
                        an empty canvas layin' around 🎨). Let's connect!
                    </p>

                    {/* CTA Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-8 w-fit rounded-lg bg-[#6366F1] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-500/20 transition-colors hover:bg-[#5850EC]"
                    >
                        Contact me
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
};
