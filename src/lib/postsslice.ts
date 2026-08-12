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
      });
  },
});

export default postsSlice.reducer;