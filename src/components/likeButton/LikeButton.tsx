import { DrawOutlineButton } from "@/components/ui/button";
import { ThumbsUpIcon } from "lucide-react";
import { getLikes } from "../../../convex/stats";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoadingTriggers } from "@/contexts/LoadingTriggersContext";

export const LikeButton = () => {
    const likes = useQuery(api.stats.getLikes);
    const addLike = useMutation(api.stats.addLike);
    const links = useQuery(api.links.getLinks);
    const [showLiked, setShowLiked] = useState(false);
    const { triggerAll } = useLoadingTriggers();

    const HandleLike = () => {
        addLike();
        triggerAll();
        setShowLiked(true);
        setTimeout(() => {
            setShowLiked(false);
        }, 1000);
    }
    

    return (
        <div>
        <DrawOutlineButton onClick={() => HandleLike()} color="#FFB9CC">
            <div className="flex items-center gap-2">
                <ThumbsUpIcon className="w-4 h-4 text-[#FFB9CC]"/>
                <span className="text-[#FFB9CC]">{likes}</span>
            </div>
        </DrawOutlineButton>
            <AnimatePresence>
            {showLiked && 
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute -top-0 -translate-x-1/10 px-4 py-1 text-[#FFB9CC] text-sm font-medium rounded-md whitespace-nowrap"
                >
                    <ThumbsUpIcon className="w-4 h-4 text-[#FFB9CC]"/>
                </motion.div>
                }
            </AnimatePresence>
        </div>
    );
};