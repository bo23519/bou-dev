"use client";

// Sources: https://www.hover.dev/components/heros
import { ReactLenis } from "lenis/react";
import {
    motion,
    AnimatePresence,
    useMotionTemplate,
    useScroll,
    useTransform,
} from "framer-motion";
import { SiSpacex } from "react-icons/si";
import { FiArrowRight } from "react-icons/fi";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { FileText, Linkedin, GitBranch, Mail, ChevronDown } from 'lucide-react';
import { useRef } from "react";

export const SmoothScrollHero = () => {
    return (
        <div className="bg-zinc-950">
            <ReactLenis
                root
                options={{
                    lerp: 0.05,
                }}
            >
                <Nav />
                <Hero />
            </ReactLenis>
        </div>
    );
};

const Nav = () => {
    return (
        <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-3 text-white">
            <SiSpacex className="text-3xl mix-blend-difference" />
            <button
                onClick={() => {
                    document.getElementById("projects")?.scrollIntoView({
                        behavior: "smooth",
                    });
                }}
                className="flex items-center gap-1 text-xs text-zinc-400"
            >
                Projects <FiArrowRight />
            </button>
        </nav>
    );
};

const SECTION_HEIGHT = 1500;

const Hero = () => {
    return (
            <div
                style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
                className="relative w-full"
            >
            <CenterImage />
            <ScrollIndicator />
            <ListOfItems />

            <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-zinc-950/0 to-zinc-950" />
            </div>
    );
};

const ScrollIndicator = () => {
    const { scrollY } = useScroll();
    
    const opacity = useTransform(scrollY, [0, 100], [1, 0]);
    const yOffset = useTransform(scrollY, [0, 100], [0, 20]);

    return (
        <motion.div 
            className="fixed bottom-8 left-1/2 z-20"
            style={{ 
                opacity,
                x: "-50%",
                y: yOffset
            }}
        >
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="flex flex-col items-center gap-2 text-white/60"
            >
                <span className="text-xs uppercase tracking-wider">Scroll</span>
                <ChevronDown className="w-6 h-6" />
            </motion.div>
        </motion.div>
    );
};

export const CenterImage = () => {
    const { scrollY } = useScroll();

    const clip1 = useTransform(scrollY, [0, 1500], [25, 0]);
    const clip2 = useTransform(scrollY, [0, 1500], [75, 100]);

    const clipPath = useMotionTemplate`polygon(${clip1}% ${clip1}%, ${clip2}% ${clip1}%, ${clip2}% ${clip2}%, ${clip1}% ${clip2}%)`;

    const backgroundSize = useTransform(
        scrollY,
        [0, SECTION_HEIGHT + 500],
        ["170%", "100%"]
    );
    const opacity = useTransform(
        scrollY,
        [SECTION_HEIGHT, SECTION_HEIGHT + 500],
        [0.2, 0]
    );

    return (
        <motion.div
            className="sticky top-0 h-screen w-full"
            style={{
                clipPath,
                backgroundSize,
                opacity,
                backgroundImage:
                    "url(https://images.unsplash.com/photo-1460186136353-977e9d6085a1?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        />
    );
};

const ListOfItems = () => {
    const links = useQuery(api.links.getLinks);
    const [showCopied, setShowCopied] = useState(false);

    const handleEmailClick = () => {
        navigator.clipboard.writeText(links?.Email?.url ?? "");
        setShowCopied(true);
        setTimeout(() => {
            setShowCopied(false);
        }, 1000);
    };

    return (
        <div 
            className="sticky top-0 z-10 mx-auto max-w-5xl px-4 pt-[200px]"
        >
            <ParallaxImg
                className="text-6xl md:text-8xl font-black tracking-tight text-white font-inter"
                children={
                    <>
                        Hi, I&apos;m <span className="text-white">Baian Ou</span>
                        <span className="text-[#6366F1]">.</span>
                        <br/>
                    </>
                }
                as="h1"
            />

            <ParallaxImg
                className="text-3xl md:text-5xl font-bold tracking-tight text-[#94A3B8]"
                children={
                    <>
                        I&apos;m a <span className="text-[#6366F1]">Software Engineer</span><br />
                        <span className="text-2xl md:text-4xl text-[#94A3B8]/80">
                            Focused on Backend & Data Systems.
                        </span>
                        <br/>
                    </>
                }
                as="h2"
            />
            <ParallaxImg
                className="max-w-2xl text-lg md:text-xl leading-relaxed text-[#B5B5B5] font-medium"
                children={
                    <>
                        2 years as a <span className="text-[#6366F1]">Data Engineer</span> in Mastercard. <br />
                        Recent <span className="text-[#6366F1]">MSCS Graduate</span> from Brown University. <br />
                        Working on <span className="text-[#6366F1]">Full-stack/Backend</span> dev. <br /><br />
                        If you are interested in learning more, let&apos;s connect!
                        <br/>
                    </>
                }
                as="p"
            />
            <ParallaxImg
                className="flex gap-4"
                children={
                    <>
                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={links?.Resume?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-8 w-fit rounded-lg bg-[#6366F1] px-4 py-2 text-lg text-white shadow-lg shadow-indigo-500/20 transition-colors hover:bg-[#5850EC] flex items-center gap-2"
                        >
                            <FileText/>Resume
                        </motion.a>
                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={links?.LinkedIn?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-8 w-fit rounded-lg bg-[#6366F1] px-4 py-2 text-lg text-white shadow-lg shadow-indigo-500/20 transition-colors hover:bg-[#5850EC] flex items-center gap-2"
                        >
                            <Linkedin />LinkedIn
                        </motion.a>
                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={links?.GitHub?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-8 w-fit rounded-lg bg-[#6366F1] px-4 py-2 text-lg text-white shadow-lg shadow-indigo-500/20 transition-colors hover:bg-[#5850EC] flex items-center gap-2"
                        >
                            <GitBranch />GitHub
                        </motion.a>
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleEmailClick}
                                className="mt-8 w-fit rounded-lg bg-[#6366F1] px-4 py-2 text-lg text-white shadow-lg shadow-indigo-500/20 transition-colors hover:bg-[#5850EC] cursor-pointer flex items-center gap-2"
                            >
                                <Mail />Email
                            </motion.button>
                            <AnimatePresence>
                                {showCopied && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute -top-2 -translate-x-1/2 px-4 py-1 bg-green-500 text-white text-sm font-medium rounded-md whitespace-nowrap"
                                    >
                                        Copied!
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </>
                }
                as="div"
            />
        </div>
    );
};

const ParallaxImg = ({
    className,
    children,
    as
}: {
    className?: string;
    children: React.ReactNode;
    as: 'div' | 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'section';
}) => {
    const { scrollY } = useScroll();

    const backgroundSize = useTransform(
        scrollY,
        [0, SECTION_HEIGHT+1000],
        ["170%", "100%"]
    );
    const opacity = useTransform(
        scrollY,
        [SECTION_HEIGHT, SECTION_HEIGHT+700],
        [1.5, 0.5]
    );
    const set_styles = {
        transformOrigin: 'center' as const,
        backfaceVisibility: 'hidden' as const,
        willChange: 'transform' as const,
        backgroundSize,
        opacity,
    };

    // Dynamically pick the motion component
    const MotionComponent = motion[as];

    return (
        <motion.div
            style={set_styles}
        >
            <MotionComponent
                className={className}
            >
                {children}
            </MotionComponent>
        </motion.div>
    );
};