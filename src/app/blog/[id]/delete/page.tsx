"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { DeleteConfirmationPage } from "@/components/admin/DeleteConfirmationPage";
import { TagDisplay } from "@/components/tags/TagDisplay";

export default function DeleteBlogPostPage() {
  const params = useParams();
  const idParam = params.id;
  const idString = Array.isArray(idParam) ? idParam[0] : idParam;
  
  const isValidId = !!(idString && typeof idString === "string" && idString !== "undefined" && idString.length > 0);
  const postId = isValidId ? (idString as Id<"blogPosts">) : undefined;

  const post = useQuery(
    api.content.blogPosts.getBlogPostById,
    postId ? { id: postId } : "skip"
  );

  const deleteBlogPost = useMutation(api.content.blogPosts.deleteBlogPost);

  const handleDelete = async () => {
    if (!postId) return;

    // SECURITY FIX: Get authentication token from localStorage
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("You must be logged in to delete a blog post");
      return;
    }

    // SECURITY FIX: Pass token to protected mutation
    await deleteBlogPost({ id: postId, token });
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
          <div className="mt-2">
            <TagDisplay tags={post.tags} size="sm" />
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
