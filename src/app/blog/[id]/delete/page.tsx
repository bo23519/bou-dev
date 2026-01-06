"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { DeleteConfirmationPage } from "@/components/admin/DeleteConfirmationPage";

export default function DeleteBlogPostPage() {
  const params = useParams();
  const idParam = params.id;
  const idString = Array.isArray(idParam) ? idParam[0] : idParam;
  
  const isValidId = idString && typeof idString === "string" && idString !== "undefined" && idString.length > 0;
  const postId = isValidId ? (idString as Id<"blogPosts">) : undefined;

  const post = useQuery(
    api.blogPosts.getBlogPostById,
    postId ? { id: postId } : "skip"
  );

  const deleteBlogPost = useMutation(api.blogPosts.deleteBlogPost);

  const handleDelete = async () => {
    if (!postId) return;
    await deleteBlogPost({ id: postId });
  };

  return (
    <DeleteConfirmationPage
      item={post}
      itemId={postId}
      isValidId={isValidId}
      title="Delete Blog Post"
      itemTitle={(post) => post.title}
      itemDescription={(post) => 
        post.tags && post.tags.length > 0 ? (
          <div className="flex gap-2 flex-wrap mt-2">
            {post.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-zinc-700 rounded text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null
      }
      onDelete={handleDelete}
      redirectTo="/blog"
      cancelHref={`/blog/${postId}`}
      itemType="blog post"
      isLoading={post === undefined}
    />
  );
}
