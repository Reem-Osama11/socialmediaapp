import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface PostComments {
  items: any[];
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  isPosting: boolean;
  postError: string;
}

interface CommentsState {
  commentsByPost: Record<string, PostComments>;
}

const initialState: CommentsState = {
  commentsByPost: {},
};

function emptyPostState(): PostComments {
  return {
    items: [],
    isLoading: false,
    isError: false,
    errorMessage: "",
    isPosting: false,
    postError: "",
  };
}

// GET /posts/:postId/comments?page=&limit=
export const getCommentsForPost = createAsyncThunk(
  "comments/getForPost",
  async (
    { postId, page = 1, limit = 10 }: { postId: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://route-posts.routemisr.com/posts/${postId}/comments?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        return rejectWithValue({ postId, message: data.message || "Failed to load comments" });
      }

      return { postId, data };
    } catch (error: any) {
      return rejectWithValue({ message: error.message || "Network error" });
    }
  }
);

// POST /posts/:postId/comments  (FormData: content, image?)
export const createComment = createAsyncThunk(
  "comments/create",
  async (
    { postId, content, image }: { postId: string; content: string; image?: File | null },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(
        `https://route-posts.routemisr.com/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        return rejectWithValue({ postId, message: data.message || "Failed to add comment" });
      }

      return { postId, data };
    } catch (error: any) {
      return rejectWithValue({ message: error.message || "Network error" });
    }
  }
);

// PUT /posts/:postId/comments/:commentId  (FormData: content, image?)
export const updateComment = createAsyncThunk(
  "comments/update",
  async (
    {
      postId,
      commentId,
      content,
      image,
    }: { postId: string; commentId: string; content: string; image?: File | null },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(
        `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        return rejectWithValue({
          postId,
          commentId,
          message: data.message || "Failed to update comment",
        });
      }

      return { postId, commentId, data };
    } catch (error: any) {
      return rejectWithValue({ message: error.message || "Network error" });
    }
  }
);

// DELETE /posts/:postId/comments/:commentId
export const deleteComment = createAsyncThunk(
  "comments/delete",
  async (
    { postId, commentId }: { postId: string; commentId: string },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        // ممكن الـ DELETE يرجع body فاضي
      }

      if (!response.ok || data.success === false) {
        return rejectWithValue({
          postId,
          commentId,
          message: data.message || "Failed to delete comment",
        });
      }

      return { postId, commentId };
    } catch (error: any) {
      return rejectWithValue({ message: error.message || "Network error" });
    }
  }
);

// PUT /posts/:postId/comments/:commentId/like
export const toggleLikeComment = createAsyncThunk(
  "comments/toggleLike",
  async (
    { postId, commentId }: { postId: string; commentId: string },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}/like`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        return rejectWithValue({
          postId,
          commentId,
          message: data.message || "Failed to like comment",
        });
      }

      return { postId, commentId, data };
    } catch (error: any) {
      return rejectWithValue({ message: error.message || "Network error" });
    }
  }
);

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // جلب الكومنتس
      .addCase(getCommentsForPost.pending, (state, action) => {
        const { postId } = action.meta.arg;
        const prev = state.commentsByPost[postId] || emptyPostState();
        state.commentsByPost[postId] = { ...prev, isLoading: true, isError: false };
      })
      .addCase(getCommentsForPost.fulfilled, (state, action) => {
        const { postId, data } = action.payload;
        const payloadData = data?.data;
        const items = Array.isArray(payloadData) ? payloadData : payloadData?.comments ?? [];
        const prev = state.commentsByPost[postId] || emptyPostState();
        state.commentsByPost[postId] = { ...prev, items, isLoading: false, isError: false };
      })
      .addCase(getCommentsForPost.rejected, (state, action: any) => {
        const postId = action.payload?.postId || action.meta.arg.postId;
        const prev = state.commentsByPost[postId] || emptyPostState();
        state.commentsByPost[postId] = {
          ...prev,
          isLoading: false,
          isError: true,
          errorMessage: action.payload?.message || "Something went wrong",
        };
      })
      // إضافة كومنت جديد
      .addCase(createComment.pending, (state, action) => {
        const { postId } = action.meta.arg;
        const prev = state.commentsByPost[postId] || emptyPostState();
        state.commentsByPost[postId] = { ...prev, isPosting: true, postError: "" };
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const { postId, data } = action.payload;
        const payloadData = data?.data;
        const newComment = payloadData?.comment ?? payloadData;
        const prev = state.commentsByPost[postId] || emptyPostState();
        state.commentsByPost[postId] = {
          ...prev,
          isPosting: false,
          items: newComment ? [newComment, ...prev.items] : prev.items,
        };
      })
      .addCase(createComment.rejected, (state, action: any) => {
        const postId = action.payload?.postId || action.meta.arg.postId;
        const prev = state.commentsByPost[postId] || emptyPostState();
        state.commentsByPost[postId] = {
          ...prev,
          isPosting: false,
          postError: action.payload?.message || "Failed to add comment",
        };
      })
      // تعديل كومنت
      .addCase(updateComment.fulfilled, (state, action) => {
        const { postId, commentId, data } = action.payload;
        const payloadData = data?.data;
        const updated = payloadData?.comment ?? payloadData;
        const prev = state.commentsByPost[postId];
        if (!prev) return;
        state.commentsByPost[postId] = {
          ...prev,
          items: prev.items.map((c) =>
            c._id === commentId ? { ...c, ...updated } : c
          ),
        };
      })
      .addCase(updateComment.rejected, (state, action: any) => {
        const postId = action.payload?.postId || action.meta.arg.postId;
        const prev = state.commentsByPost[postId];
        if (!prev) return;
        state.commentsByPost[postId] = {
          ...prev,
          postError: action.payload?.message || "Failed to update comment",
        };
      })
      // حذف كومنت
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;
        const prev = state.commentsByPost[postId];
        if (!prev) return;
        state.commentsByPost[postId] = {
          ...prev,
          items: prev.items.filter((c) => c._id !== commentId),
        };
      })
      .addCase(deleteComment.rejected, (state, action: any) => {
        const postId = action.payload?.postId || action.meta.arg.postId;
        const prev = state.commentsByPost[postId];
        if (!prev) return;
        state.commentsByPost[postId] = {
          ...prev,
          postError: action.payload?.message || "Failed to delete comment",
        };
      })
      // لايك/أنلايك كومنت
      .addCase(toggleLikeComment.fulfilled, (state, action) => {
        const { postId, commentId, data } = action.payload;
        const payloadData = data?.data;
        const updated = payloadData?.comment ?? payloadData;
        const prev = state.commentsByPost[postId];
        if (!prev) return;
        state.commentsByPost[postId] = {
          ...prev,
          items: prev.items.map((c) =>
            c._id === commentId ? { ...c, ...updated } : c
          ),
        };
      })
      .addCase(toggleLikeComment.rejected, (state, action: any) => {
        const postId = action.payload?.postId || action.meta.arg.postId;
        const prev = state.commentsByPost[postId];
        if (!prev) return;
        state.commentsByPost[postId] = {
          ...prev,
          postError: action.payload?.message || "Failed to like comment",
        };
      });
  },
});

export default commentsSlice.reducer;