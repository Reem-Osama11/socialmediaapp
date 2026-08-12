import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface ProfileState {
  profileData: any;
  isLoading: boolean;
  isUploading: boolean;
  isError: boolean;
  errorMessage: string;

  suggestions: any[];
  isSuggestionsLoading: boolean;
  isSuggestionsError: boolean;
  suggestionsErrorMessage: string;
  suggestionsPagination: {
    currentPage: number;
    numberOfPages: number | null; // null = unknown yet (backend didn't send it)
  };

  viewedProfiles: Record<
    string,
    {
      data: any;
      isLoading: boolean;
      isError: boolean;
      errorMessage: string;
    }
  >;

  followLoadingIds: string[];
}

const initialState: ProfileState = {
  profileData: null,
  isLoading: false,
  isUploading: false,
  isError: false,
  errorMessage: "",

  suggestions: [],
  isSuggestionsLoading: false,
  isSuggestionsError: false,
  suggestionsErrorMessage: "",
  suggestionsPagination: {
    currentPage: 1,
    numberOfPages: null,
  },

  viewedProfiles: {},

  followLoadingIds: [],
};

// GET /users/profile-data -> fetches the current user's profile data
export const getProfileData = createAsyncThunk(
  "profile/getProfileData",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "https://route-posts.routemisr.com/users/profile-data",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        return rejectWithValue(data.message || "Failed to load profile data");
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to load profile data");
    }
  }
);

// PUT /users/upload-photo -> uploads the profile photo to Cloudflare R2
export const updateProfilePhoto = createAsyncThunk(
  "profile/updatePhoto",
  async (photoFile: File, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("photo", photoFile); // double-check the field name in the Postman docs if you get a validation error

      const response = await fetch(
        "https://route-posts.routemisr.com/users/upload-photo",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`, // don't set Content-Type manually with FormData
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        return rejectWithValue(data.message || "Failed to upload photo");
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to upload photo");
    }
  }
);

// GET /users/suggestions?limit=&page= -> fetches follow suggestions (paginated)
export const getFollowSuggestions = createAsyncThunk(
  "profile/getFollowSuggestions",
  async (
    { limit = 10, page = 1 }: { limit?: number; page?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://route-posts.routemisr.com/users/suggestions?limit=${limit}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        return rejectWithValue(data.message || "Failed to load suggestions");
      }

      // keep the requested page attached, since some backends omit it from the response
      return { ...data, __requestedPage: page };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to load suggestions");
    }
  }
);

// GET /users/:userId/profile -> fetches another user's profile
export const getUserProfile = createAsyncThunk(
  "profile/getUserProfile",
  async ({ userId }: { userId: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://route-posts.routemisr.com/users/${userId}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        return rejectWithValue({
          userId,
          message: data.message || "Failed to load profile",
        });
      }

      return { userId, data };
    } catch (error: any) {
      return rejectWithValue({
        userId,
        message: error.message || "A network error occurred",
      });
    }
  }
);

// PUT /users/:userId/follow -> follow/unfollow a user
export const toggleFollowUser = createAsyncThunk(
  "profile/toggleFollowUser",
  async ({ userId }: { userId: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://route-posts.routemisr.com/users/${userId}/follow`,
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
          userId,
          message: data.message || "Failed to perform this action",
        });
      }

      return { userId, data };
    } catch (error: any) {
      return rejectWithValue({
        userId,
        message: error.message || "A network error occurred",
      });
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // adds/removes a userId from a "following" array that may hold plain id
    // strings or full user objects ({ _id: ... }) depending on what the API sent
    function toggleIdInFollowingList(list: any[] | undefined, userId: string) {
      const current = Array.isArray(list) ? list : [];
      const idOf = (item: any) =>
        typeof item === "string" ? item : item?._id;

      const exists = current.some((item) => idOf(item) === userId);
      return exists
        ? current.filter((item) => idOf(item) !== userId)
        : [...current, userId];
    }

    builder
      // fetch current user's profile
      .addCase(getProfileData.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getProfileData.fulfilled, (state, action) => {
        state.isLoading = false;
        // Response shape: { data: { user: {...} } }
        state.profileData = action.payload?.data?.user ?? null;
      })
      .addCase(getProfileData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage =
          (action.payload as string) || "Failed to load profile data";
      })
      // upload/update photo
      .addCase(updateProfilePhoto.pending, (state) => {
        state.isUploading = true;
        state.isError = false;
      })
      .addCase(updateProfilePhoto.fulfilled, (state, action) => {
        state.isUploading = false;
        // Same shape: { data: { user: {...} } } - merge with the previous state just in case
        const updatedUser = action.payload?.data?.user ?? action.payload?.data ?? {};
        state.profileData = { ...state.profileData, ...updatedUser };
      })
      .addCase(updateProfilePhoto.rejected, (state, action) => {
        state.isUploading = false;
        state.isError = true;
        state.errorMessage =
          (action.payload as string) || "Failed to upload photo";
      })

      // follow suggestions
      .addCase(getFollowSuggestions.pending, (state) => {
        state.isSuggestionsLoading = true;
        state.isSuggestionsError = false;
      })
      .addCase(getFollowSuggestions.fulfilled, (state, action) => {
        state.isSuggestionsLoading = false;

        const payload: any = action.payload;

        // check the common shapes the server might return
        const candidate =
          payload?.data?.suggestions ??
          payload?.data?.users ??
          payload?.users ??
          payload?.suggestions ??
          payload?.results ??
          payload?.data ??
          payload;

        const list = Array.isArray(candidate) ? candidate : [];

        // attach isFollowed to every item (try to read it from the server, default to false)
        state.suggestions = list.map((u: any) => ({
          ...u,
          isFollowed: Boolean(
            u.isFollowed ?? u.following ?? u.isFollowing ?? false
          ),
        }));

        // read pagination info from meta.pagination (common field names covered defensively)
        const paginationMeta = payload?.meta?.pagination ?? payload?.pagination ?? {};
        const currentPage =
          paginationMeta.currentPage ??
          paginationMeta.page ??
          payload?.__requestedPage ??
          1;
        const numberOfPages =
          paginationMeta.numberOfPages ??
          paginationMeta.totalPages ??
          paginationMeta.pages ??
          null;

        state.suggestionsPagination = {
          currentPage,
          numberOfPages,
        };
      })
      .addCase(getFollowSuggestions.rejected, (state, action) => {
        state.isSuggestionsLoading = false;
        state.isSuggestionsError = true;
        state.suggestionsErrorMessage =
          (action.payload as string) || "Failed to load suggestions";
      })

      // another user's profile
      .addCase(getUserProfile.pending, (state, action) => {
        const { userId } = action.meta.arg;
        state.viewedProfiles[userId] = {
          data: state.viewedProfiles[userId]?.data ?? null,
          isLoading: true,
          isError: false,
          errorMessage: "",
        };
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        const { userId, data } = action.payload;
        state.viewedProfiles[userId] = {
          data: data?.data?.user ?? data?.data ?? null,
          isLoading: false,
          isError: false,
          errorMessage: "",
        };
      })
      .addCase(getUserProfile.rejected, (state, action: any) => {
        const userId = action.payload?.userId || action.meta.arg.userId;
        state.viewedProfiles[userId] = {
          data: state.viewedProfiles[userId]?.data ?? null,
          isLoading: false,
          isError: true,
          errorMessage:
            action.payload?.message || "Failed to load profile",
        };
      })

      // follow / unfollow
      .addCase(toggleFollowUser.pending, (state, action) => {
        const { userId } = action.meta.arg;
        if (!state.followLoadingIds.includes(userId)) {
          state.followLoadingIds.push(userId);
        }

        // optimistic update: flip the state immediately, before the request finishes
        state.suggestions = state.suggestions.map((u: any) =>
          u._id === userId ? { ...u, isFollowed: !u.isFollowed } : u
        );

        // also keep profileData.following in sync so things like the Navbar
        // badge count update instantly, without needing a page refresh
        if (state.profileData) {
          state.profileData.following = toggleIdInFollowingList(
            state.profileData.following,
            userId
          );
        }
      })
      .addCase(toggleFollowUser.fulfilled, (state, action) => {
        const { userId, data } = action.payload;
        state.followLoadingIds = state.followLoadingIds.filter(
          (id) => id !== userId
        );

        const updated = data?.data?.user ?? data?.data ?? {};

        // update this user's cached profile if it was already loaded (don't touch
        // isFollowed since it isn't tracked in this shape of data)
        if (state.viewedProfiles[userId]) {
          state.viewedProfiles[userId].data = {
            ...state.viewedProfiles[userId].data,
            ...updated,
          };
        }

        // update the same user if it's shown in the suggestions list (don't touch
        // isFollowed since it was already flipped optimistically in "pending",
        // which is the source of truth here)
        state.suggestions = state.suggestions.map((u: any) =>
          u._id === userId ? { ...u, ...updated, isFollowed: u.isFollowed } : u
        );
      })
      .addCase(toggleFollowUser.rejected, (state, action: any) => {
        const userId = action.payload?.userId || action.meta.arg.userId;
        state.followLoadingIds = state.followLoadingIds.filter(
          (id) => id !== userId
        );

        // request failed: revert to the state before the click
        state.suggestions = state.suggestions.map((u: any) =>
          u._id === userId ? { ...u, isFollowed: !u.isFollowed } : u
        );

        // revert the optimistic profileData.following change too
        if (state.profileData) {
          state.profileData.following = toggleIdInFollowingList(
            state.profileData.following,
            userId
          );
        }
      });
  },
});

export default profileSlice.reducer;