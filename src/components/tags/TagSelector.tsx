"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { X, Plus } from "lucide-react";
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

  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCreateForm(false);
        setInputValue("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTagColor = (tagName: string): string => {
    const tag = allTags?.find((t) => t.name === tagName);
    return tag?.color || "#787878";
  };

  // Filter tags based on input and exclude already selected
  const filteredTags = allTags?.filter(
    (tag) =>
      !selectedTags.includes(tag.name) &&
      tag.name.toLowerCase().includes(inputValue.toLowerCase())
  ) || [];

  const addTag = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      onChange([...selectedTags, tagName]);
    }
    setInputValue("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagName: string) => {
    onChange(selectedTags.filter((t) => t !== tagName));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    setShowCreateForm(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && inputValue === "" && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
    if (e.key === "Enter" && filteredTags.length > 0) {
      e.preventDefault();
      addTag(filteredTags[0].name);
    }
    if (e.key === "Escape") {
      setIsOpen(false);
      setInputValue("");
    }
  };

  const handleCreateTag = async () => {
    const tagName = inputValue.trim();
    if (!tagName || !selectedColor) return;

    setIsCreating(true);
    try {
      await createTag({
        name: tagName,
        colorScheme: selectedColor,
      });
      addTag(tagName);
      setSelectedColor(null);
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating tag:", error);
      alert(error instanceof Error ? error.message : "Failed to create tag");
    } finally {
      setIsCreating(false);
    }
  };

  const canCreateNewTag = inputValue.trim() && 
    !allTags?.some((t) => t.name.toLowerCase() === inputValue.trim().toLowerCase());

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-300">{label}</label>

      <div className="relative" ref={containerRef}>
        {/* Input field with selected tags */}
        <div
          className="flex flex-wrap items-center gap-2 min-h-[42px] px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg cursor-text focus-within:ring-2 focus-within:ring-[#D8FA00] focus-within:border-transparent"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Selected tags shown inline */}
          {selectedTags.map((tagName) => (
            <span
              key={tagName}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-sm font-medium rounded"
              style={{
                backgroundColor: `${getTagColor(tagName)}20`,
                color: getTagColor(tagName),
                border: `1px solid ${getTagColor(tagName)}40`,
              }}
            >
              {tagName}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tagName);
                }}
                className="hover:opacity-70 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleInputKeyDown}
            placeholder={selectedTags.length === 0 ? "Type to search tags..." : ""}
            className="flex-1 min-w-[120px] bg-transparent text-[#EFF0EF] placeholder-zinc-500 outline-none text-sm"
          />
        </div>

        {/* Dropdown */}
        {isOpen && (inputValue || filteredTags.length > 0 || canCreateNewTag) && (
          <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
            {/* Matching tags */}
            {filteredTags.length > 0 && (
              <div className="p-1">
                {filteredTags.map((tag) => (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => addTag(tag.name)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-zinc-800 transition-colors text-left"
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span style={{ color: tag.color }}>{tag.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* No matches message */}
            {inputValue && filteredTags.length === 0 && !canCreateNewTag && (
              <div className="px-3 py-2 text-sm text-zinc-500">
                Tag already selected
              </div>
            )}

            {/* Create new tag option */}
            {canCreateNewTag && !showCreateForm && (
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-[#D8FA00] hover:bg-zinc-800 transition-colors border-t border-zinc-700"
              >
                <Plus className="w-4 h-4" />
                Create &quot;{inputValue.trim()}&quot;
              </button>
            )}

            {/* Create tag form - color selection */}
            {showCreateForm && (
              <div className="p-3 border-t border-zinc-700 space-y-3">
                <div className="text-sm text-zinc-300">
                  Creating tag: <span className="font-medium text-[#EFF0EF]">{inputValue.trim()}</span>
                </div>

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
                    disabled={!selectedColor || isCreating}
                    className="flex-1 px-3 py-1.5 bg-[#D8FA00] text-black text-sm font-medium rounded hover:bg-[#C8E600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? "Creating..." : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
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
