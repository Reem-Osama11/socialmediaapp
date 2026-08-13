import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface PostsState {
  allPosts: any[];
  pagination: any | null;
  isLoading: boolean; // true only for the very first page load
  isLoadingMore: boolean; // true while fetching page > 1 ("Load More")
  isError: boolean;
  errorMessage: string;
  isPosting: boolean;
  postError: string;
  sharingPostId: string | null; // which post is currently being shared (for per-post spinner)
  shareError: string;
  likingPostId: string | null; // which post is currently being liked/unliked (for per-post spinner)
  likeError: string;
}

const initialState: PostsState = {
  allPosts: [],
  pagination: null,
  isLoading: false,
  isLoadingMore: false,
  isError: false,
  errorMessage: "",
  isPosting: false,
  postError: "",
  sharingPostId: null,
  shareError: "",
  likingPostId: null,
  likeError: "",
};

// GET /posts?page=&limit=
// limit defaults to 20 (instead of whatever small default the backend uses) so a
// single load already shows a lot more than a handful of posts. Call with a higher
// page to fetch more without losing what's already shown (see the reducer below).
export const getAllPosts = createAsyncThunk(
  "posts/getAllPosts",
  async (
    { page = 1, limit = 20 }: { page?: number; limit?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://route-posts.routemisr.com/posts?page=${page}&limit=${limit}`,
        {
          headers: {
            token: token || "",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        return rejectWithValue(data.message || "Failed to load posts");
      }

      return { ...data, __requestedPage: page };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to load posts");
    }
  }
);

// POST /posts  (FormData: body, image?)
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (
    { body, image }: { body: string; image?: File | null },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("body", body);
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch("https://route-posts.routemisr.com/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // don't set Content-Type with FormData
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        return rejectWithValue(data.message || "Failed to create post");
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create post");
    }
  }
);

// POST /posts/:id/share  (JSON body: { body })
// Actually hits the backend (not just a local/optimistic bump) so that a page
// refresh - which re-fetches posts from getAllPosts - still shows the share
// because it's really persisted on the server, not just faked in the store.
export const sharePost = createAsyncThunk(
  "posts/sharePost",
  async (
    { postId, body }: { postId: string; body?: string },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://route-posts.routemisr.com/posts/${postId}/share`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ body: body || "" }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        return rejectWithValue(data.message || "Failed to share post");
      }

      return { ...data, __postId: postId };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to share post");
    }
  }
);

// PUT /posts/:id/like  (toggles like/unlike server-side)
export const toggleLikePost = createAsyncThunk(
  "posts/toggleLikePost",
  async (
    { postId, userId }: { postId: string; userId?: string | null },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://route-posts.routemisr.com/posts/${postId}/like`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            token: token || "", // this API is inconsistent about which header it wants, send both
          },
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        return rejectWithValue(data.message || "Failed to like post");
      }

      return { ...data, __postId: postId, __userId: userId };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to like post");
    }
  }
);

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllPosts.pending, (state, action) => {
        const requestedPage = action.meta.arg?.page ?? 1;
        if (requestedPage > 1) {
          state.isLoadingMore = true;
        } else {
          state.isLoading = true;
        }
        state.isError = false;
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;

        const payload: any = action.payload;
        // API shape: { success, message, data: { posts: [...] }, meta: { pagination } }
        // handle both data.posts and posts directly, just in case
        const newPosts = payload?.data?.posts ?? payload?.posts ?? [];
        const requestedPage = payload?.__requestedPage ?? 1;

        if (requestedPage > 1) {
          // "Load More": append, skipping any duplicates that might come back
          const existingIds = new Set(state.allPosts.map((p: any) => p._id));
          const deduped = newPosts.filter((p: any) => !existingIds.has(p._id));
          state.allPosts = [...state.allPosts, ...deduped];
        } else {
          // first page / refresh: replace
          state.allPosts = newPosts;
        }

        state.pagination = payload?.meta?.pagination ?? null;
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.isError = true;
        state.errorMessage = (action.payload as string) || "Failed to load posts";
      })
      // create a new post
      .addCase(createPost.pending, (state) => {
        state.isPosting = true;
        state.postError = "";
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isPosting = false;
        const payload: any = action.payload;
        const newPost = payload?.data?.post ?? payload?.data ?? payload?.post;
        if (newPost) {
          state.allPosts = [newPost, ...state.allPosts];
        }
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isPosting = false;
        state.postError = (action.payload as string) || "Failed to create post";
      })
      // share an existing post
      .addCase(sharePost.pending, (state, action) => {
        state.sharingPostId = action.meta.arg.postId;
        state.shareError = "";
      })
      .addCase(sharePost.fulfilled, (state, action) => {
        state.sharingPostId = null;

        const payload: any = action.payload;
        const postId = payload?.__postId;
        // some backends echo back the updated post (with a fresh shares
        // array/count), others just send { success: true }. Handle both.
        const updatedPost = payload?.data?.post ?? payload?.data ?? payload?.post;

        state.allPosts = state.allPosts.map((p: any) => {
          if (p._id !== postId) return p;

          if (updatedPost && typeof updatedPost === "object" && updatedPost._id) {
            return { ...p, ...updatedPost };
          }

          // fallback: bump a local counter so the UI still reflects the action
          // immediately even if the API replied with no post body
          const currentShares = p.shares?.length ?? p.sharesCount ?? 0;
          return { ...p, sharesCount: currentShares + 1 };
        });
      })
      .addCase(sharePost.rejected, (state, action) => {
        state.sharingPostId = null;
        state.shareError = (action.payload as string) || "Failed to share post";
      })
      // like/unlike a post
      .addCase(toggleLikePost.pending, (state, action) => {
        state.likingPostId = action.meta.arg.postId;
        state.likeError = "";
      })
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        state.likingPostId = null;

        const payload: any = action.payload;
        const postId = payload?.__postId;
        const userId = payload?.__userId;
        const updatedPost = payload?.data?.post ?? payload?.data ?? payload?.post;

        state.allPosts = state.allPosts.map((p: any) => {
          if (p._id !== postId) return p;

          // if the API echoes back the updated post with a real likes array, trust it
          if (updatedPost && typeof updatedPost === "object" && Array.isArray(updatedPost.likes)) {
            return { ...p, ...updatedPost };
          }

          // fallback: toggle locally based on who's logged in, since some
          // responses just send back { success: true } with no post body
          const likes = Array.isArray(p.likes) ? p.likes : [];
          const norm = (v: any) =>
            typeof v === "object" && v?._id ? String(v._id) : String(v);
          const alreadyLiked = userId ? likes.some((l: any) => norm(l) === userId) : false;

          const newLikes = alreadyLiked
            ? likes.filter((l: any) => norm(l) !== userId)
            : userId
            ? [...likes, userId]
            : likes;

          return { ...p, likes: newLikes };
        });
      })
      .addCase(toggleLikePost.rejected, (state, action) => {
        state.likingPostId = null;
        state.likeError = (action.payload as string) || "Failed to like post";
      });
  },
});

export default postsSlice.reducer;