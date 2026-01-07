"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface TagDisplayProps {
  tags: string[];
  maxTags?: number;
  size?: "sm" | "md";
}

export function TagDisplay({ tags, maxTags, size = "sm" }: TagDisplayProps) {
  const allTags = useQuery(api.tags.getAllTags);

  const getTagColor = (tagName: string): string => {
    const tag = allTags?.find((t) => t.name === tagName);
    return tag?.color || "#787878";
  };

  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const remainingCount = maxTags ? Math.max(0, tags.length - maxTags) : 0;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {displayTags.map((tagName, index) => {
        const color = getTagColor(tagName);
        return (
          <span
            key={index}
            className={`${sizeClasses[size]} font-medium rounded`}
            style={{
              backgroundColor: `${color}20`,
              color: color,
              border: `1px solid ${color}40`,
            }}
          >
            {tagName}
          </span>
        );
      })}
      {remainingCount > 0 && (
        <span className={`${sizeClasses[size]} font-medium text-zinc-500`}>
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}
