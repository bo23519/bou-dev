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
                <Hero />
            </ReactLenis>
        </div>
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
                className="flex flex-col items-center gap-2 text-[#EFF0EF]/60"
            >
                <span className="text-xs uppercase tracking-wider">Scroll</span>
                <ChevronDown className="w-6 h-6" />
            </motion.div>
        </motion.div>
    );
};

// From template
// Center image of the hero section
export const CenterImage = () => {
    const { scrollY } = useScroll();
    const assets = useQuery(api.storage.assets.getAssets);
    const backgroundUrl = assets?.heroBackground?.url;

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
        [0.5, 0]
    );

    return (
        <motion.div
            className="sticky top-0 h-screen w-full"
            style={{
                clipPath,
                backgroundSize,
                opacity,
                backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        />
    );
};

// Items to display in the hero section
const ListOfItems = () => {
    const links = useQuery(api.system.links.getLinks);
    const assets = useQuery(api.storage.assets.getAssets);
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
            className="sticky top-0 z-10 ml-auto max-w-5xl right-0 px-4 pr-8 md:pr-16 lg:pr-24 pt-[200px]"
        >
            {/* Texts */}
            <ParallaxImg
                className="text-6xl md:text-8xl font-black tracking-tight text-[#EFF0EF] font-inter"
                children={
                    <>
                        Hi, I&apos;m <span className="text-[#EFF0EF]">Baian Ou</span>
                        <span className="text-[#22C6CE]">.</span>
                        <br/>
                    </>
                }
                as="h1"
            />

            <ParallaxImg
                className="text-3xl md:text-5xl font-bold tracking-tight text-[#E8E8E8]"
                children={
                    <>
                        I&apos;m a <span className="text-[#22C6CE]">Software Engineer</span><br />
                        <span className="text-2xl md:text-4xl text-[#E8E8E8]/80">
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
                        2 years as a <span className="text-[#22C6CE]">Data Engineer</span> in Mastercard. <br />
                        Recent <span className="text-[#22C6CE]">MSCS Graduate</span> from Brown University. <br />
                        Working on <span className="text-[#22C6CE]">Full-stack/Backend</span> dev. <br /><br />
                        If you are interested in learning more, let&apos;s connect!
                        <br/>
                    </>
                }
                as="p"
            />
            {/* Links/Buttons */}
            <ParallaxImg
                className="flex flex-wrap gap-4"
                children={
                    <>
                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={assets?.resume?.url ?? links?.Resume?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="zzz-button zzz-button-miyabi mt-8 flex items-center gap-2 hover:text-[#181818]"
                        >
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5"/>Resume
                        </motion.a>
                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={links?.LinkedIn?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="zzz-button zzz-button-miyabi mt-8 flex items-center gap-2 hover:text-[#181818]"
                        >
                            <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />LinkedIn
                        </motion.a>
                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={links?.GitHub?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="zzz-button zzz-button-miyabi mt-8 flex items-center gap-2 hover:text-[#181818]"
                        >
                            <GitBranch className="w-4 h-4 sm:w-5 sm:h-5" />GitHub
                        </motion.a>
                        <div className="relative">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleEmailClick}
                                className="zzz-button zzz-button-miyabi mt-8 cursor-pointer flex items-center gap-2 color-[#22C6CE] hover:text-[#181818]"
                            >
                                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />Email
                            </motion.button>
                            <AnimatePresence>
                                {showCopied && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute -top-2 -translate-x-1/2 px-4 py-1 bg-white-500 text-[#22C6CE] text-sm font-medium rounded-md whitespace-nowrap"
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

// From template
// Effect for the texts and buttons in the hero section
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