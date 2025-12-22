// Source: https://www.hover.dev/components/carousels

"use client";

import { motion, useTransform, useScroll } from "framer-motion";
import { useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

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

export const HorizontalScrollCarousel = () => {
    // 1. Fetch data from Convex
    const projects = useQuery(api.projects.getProjects);

    const targetRef = useRef<HTMLDivElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    const x = useTransform(scrollYProgress, [0, 1], ["1%", "-95%"]);

    return (
        <section ref={targetRef} className="relative h-[300vh] bg-neutral-900">
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
                            return <Card project={project} key={project._id} />;
                        })}
                    </motion.div>
                )}
            </div>
        </section>
    );
};

const Card = ({ project }: { project: CardType }) => {
    return (
        <div
            key={project._id}
            className="group relative h-[450px] w-[450px] overflow-hidden bg-neutral-200"
        >
            <div className="absolute inset-0 z-0 transition-transform duration-300 group-hover:scale-110">
                <div className="h-full w-full [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:blur-sm">
                    <img src={project.storageId} alt={project.title} />
                </div>
            </div>
            <div className="absolute inset-0 z-10 grid place-content-center">
                <p className="bg-gradient-to-br from-black/50 to-black/0 p-8 text-6xl font-black uppercase text-white backdrop-blur-lg">
                    {project.title}
                </p>
            </div>
            <div className="absolute inset-0 z-10 grid place-content-center">
                <p className="bg-gradient-to-br from-black/50 to-black/0 p-8 text-6xl font-black uppercase text-white backdrop-blur-lg">
                    {project.tags.join(", ")}
                </p>
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
};