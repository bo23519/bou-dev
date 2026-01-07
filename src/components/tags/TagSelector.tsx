"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { X, Plus, Check } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface Tag {
  _id: Id<"tags">;
  name: string;
  color: string;
}

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  label?: string;
}

export function TagSelector({ selectedTags, onChange, label = "Tags" }: TagSelectorProps) {
  const allTags = useQuery(api.tags.getAllTags);
  const colorSchemes = useQuery(api.tags.getColorSchemes);
  const createTag = useMutation(api.tags.createTag);

  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCreateForm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onChange(selectedTags.filter((t) => t !== tagName));
    } else {
      onChange([...selectedTags, tagName]);
    }
  };

  const removeTag = (tagName: string) => {
    onChange(selectedTags.filter((t) => t !== tagName));
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !selectedColor) return;

    setIsCreating(true);
    try {
      await createTag({
        name: newTagName.trim(),
        colorScheme: selectedColor,
      });
      onChange([...selectedTags, newTagName.trim()]);
      setNewTagName("");
      setSelectedColor(null);
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating tag:", error);
      alert(error instanceof Error ? error.message : "Failed to create tag");
    } finally {
      setIsCreating(false);
    }
  };

  const getTagColor = (tagName: string): string => {
    const tag = allTags?.find((t) => t.name === tagName);
    return tag?.color || "#787878";
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-300">{label}</label>

      {/* Selected tags */}
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {selectedTags.map((tagName) => (
          <span
            key={tagName}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium rounded"
            style={{
              backgroundColor: `${getTagColor(tagName)}20`,
              color: getTagColor(tagName),
              border: `1px solid ${getTagColor(tagName)}40`,
            }}
          >
            {tagName}
            <button
              type="button"
              onClick={() => removeTag(tagName)}
              className="hover:opacity-70 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-[#EFF0EF] text-left hover:border-zinc-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#D8FA00]"
        >
          {selectedTags.length === 0 ? "Select tags..." : `${selectedTags.length} tag(s) selected`}
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
            {/* Existing tags */}
            {allTags && allTags.length > 0 && (
              <div className="p-2 space-y-1">
                {allTags.map((tag) => (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => toggleTag(tag.name)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-zinc-800 transition-colors"
                  >
                    <span
                      className="flex items-center gap-2"
                      style={{ color: tag.color }}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </span>
                    {selectedTags.includes(tag.name) && (
                      <Check className="w-4 h-4 text-[#D8FA00]" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Create new tag button */}
            {!showCreateForm && (
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-[#D8FA00] hover:bg-zinc-800 transition-colors border-t border-zinc-700"
              >
                <Plus className="w-4 h-4" />
                Create new tag
              </button>
            )}

            {/* Create tag form */}
            {showCreateForm && (
              <div className="p-3 border-t border-zinc-700 space-y-3">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag name"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded text-[#EFF0EF] text-sm focus:outline-none focus:ring-1 focus:ring-[#D8FA00]"
                />

                {/* Color selection */}
                <div className="space-y-2">
                  <span className="text-xs text-zinc-400">Select color:</span>
                  <div className="flex flex-wrap gap-2">
                    {colorSchemes?.map((scheme) => (
                      <button
                        key={scheme.name}
                        type="button"
                        onClick={() => setSelectedColor(scheme.name)}
                        className={`w-6 h-6 rounded-full transition-all ${
                          selectedColor === scheme.name
                            ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900"
                            : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: scheme.color }}
                        title={scheme.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim() || !selectedColor || isCreating}
                    className="flex-1 px-3 py-1.5 bg-[#D8FA00] text-black text-sm font-medium rounded hover:bg-[#C8E600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? "Creating..." : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewTagName("");
                      setSelectedColor(null);
                    }}
                    className="px-3 py-1.5 bg-zinc-700 text-zinc-300 text-sm rounded hover:bg-zinc-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
