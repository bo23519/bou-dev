// Source: https://www.hover.dev/components/carousels

"use client";

import { motion, useTransform, useScroll } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Github, ExternalLink, Edit2 } from "lucide-react";
import { TagDisplay } from "@/components/tags/TagDisplay";

// From template
export const HorizontalScrollCarouselExample = () => {
    return (
        <div className="bg-neutral-800">
            <div className="flex h-48 items-center justify-center">
                <span className="font-semibold uppercase text-neutral-500">
                    Scroll down
                </span>
            </div>
            <HorizontalScrollCarousel />
            <div className="flex h-48 items-center justify-center">
                <span className="font-semibold uppercase text-neutral-500">
                    Scroll up
                </span>
            </div>
        </div>
    );
};

// From template
export const HorizontalScrollCarousel = () => {
    // 1. Fetch data from Convex
    const projects = useQuery(api.content.projects.getProjects);
    const verifyTokenMutation = useMutation((api as any).auth.verifyToken);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("authToken");
            if (token) {
                try {
                    const result = await verifyTokenMutation({ token });
                    if (result?.valid && result.role === "admin") {
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                    }
                } catch (error) {
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        };
        checkAuth();
    }, [verifyTokenMutation]);

    const targetRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-65%"]);

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-[#121212]">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                {projects === undefined ? (
                    <div className="w-full flex items-center justify-center text-neutral-500 italic">
                        Loading projects...
                    </div>
                ) : projects.length === 0 ? (
                    <div className="w-full flex items-center justify-center text-neutral-500 italic border-2 border-dashed border-neutral-700 rounded-xl mx-8 h-48">
                        No projects found. Try importing some data!
                    </div>
                ) : (
                    <motion.div style={{ x }} className="flex gap-4">
                        {projects.map((project: CardType) => {
                            return <Card project={project} key={project._id} isAdmin={isAdmin} />;
                        })}
                    </motion.div>
                )}
            </div>
        </section>
    );
};

const Card = ({ project, isAdmin }: { project: CardType; isAdmin: boolean }) => {
    const router = useRouter();

    return (
        <div
            key={project._id}
            className="group relative h-[400px] sm:h-[450px] w-[90vw] sm:w-[450px] overflow-hidden bg-neutral-200"
        >
            <div className="absolute inset-0 z-0 transition-transform duration-300 group-hover:scale-110">
                <div className="h-full w-full [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:blur-sm">
                    <img src={project.storageId} alt={project.title} />
                </div>
            </div>
            {/* Each project card has a dark background with a gradient */}
            <div className="absolute inset-0 z-5 bg-black/40"></div>
            
            {/* Edit button for admin - top right */}
            {isAdmin && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/project/${project._id}/edit`);
                    }}
                    className="absolute top-4 right-4 z-20 p-2 rounded-lg transition-colors text-[#181818] hover:text-white"
                    title="Edit Project"
                >
                    Edit
                </button>
            )}
            
            <div className="absolute inset-0 z-10 flex flex-col justify-center items-start px-4 sm:px-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full mb-4">
                    {/* Title of the project */}
                    <p className="bg-gradient-to-br from-black/50 to-black/10 p-4 sm:p-8 text-2xl sm:text-5xl font-black uppercase text-[#22C6CE]">    
                        {project.title}
                    </p>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* project repo and link icons */}
                        <div className="flex items-center gap-3">
                            {project.repo && (
                                <a
                                    href={project.repo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#EFF0EF] hover:text-[#D8FA00] transition-colors"
                                >
                                    <Github className="w-5 h-5" />
                                </a>
                            )}
                            {project.link && (
                                <a
                                    href={project.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#EFF0EF] hover:text-[#D8FA00] transition-colors"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                        <div className="flex-1 h-px bg-neutral-400/30"></div>
                    </div>
                </div>
                {/* Tags of the project */}
                <div className="mb-4">
                    <TagDisplay tags={project.tags} size="sm" />
                </div>
                {/* Description of the project */}
                {project.description && (
                    <p className="text-white text-sm leading-relaxed max-w-md]">
                        {project.description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default HorizontalScrollCarousel;

type CardType = {
    _id: string;
    storageId: string;
    title: string;
    description: string;
    tags: string[];
    link?: string;
    repo?: string;
    dark_theme?: boolean;
};