import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface NotificationsState {
  unreadCount: number;
  isLoadingUnreadCount: boolean;
  isUnreadCountError: boolean;
  unreadCountErrorMessage: string;

  markingReadIds: string[]; // notification ids currently being marked as read
  isMarkingAllRead: boolean;

  errorMessage: string; // last mark-as-read / mark-all-read error, if any
}

const initialState: NotificationsState = {
  unreadCount: 0,
  isLoadingUnreadCount: false,
  isUnreadCountError: false,
  unreadCountErrorMessage: "",

  markingReadIds: [],
  isMarkingAllRead: false,

  errorMessage: "",
};

// small helper: some of these endpoints return an empty body ("No response body"
// per the docs), so response.json() would throw on those - this reads the body
// safely either way and never breaks the thunk
async function safeReadJson(response: Response): Promise<any> {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

// GET /notifications/unread-count
export const getUnreadNotificationsCount = createAsyncThunk(
  "notifications/getUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "https://route-posts.routemisr.com/notifications/unread-count",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await safeReadJson(response);

      if (!response.ok || data.success === false) {
        return rejectWithValue(data.message || "Failed to load unread count");
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to load unread count");
    }
  }
);

// PATCH /notifications/:notificationId/read
export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async ({ notificationId }: { notificationId: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://route-posts.routemisr.com/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await safeReadJson(response);

      if (!response.ok || data.success === false) {
        return rejectWithValue({
          notificationId,
          message: data.message || "Failed to mark notification as read",
        });
      }

      return { notificationId, data };
    } catch (error: any) {
      return rejectWithValue({
        notificationId,
        message: error.message || "A network error occurred",
      });
    }
  }
);

// PATCH /notifications/read-all
export const markAllNotificationsAsRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "https://route-posts.routemisr.com/notifications/read-all",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await safeReadJson(response);

      if (!response.ok || data.success === false) {
        return rejectWithValue(data.message || "Failed to mark all as read");
      }

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to mark all as read");
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // call this manually if you ever need to nudge the badge locally
    // (e.g. a socket event told you a new notification came in)
    incrementUnreadCount(state) {
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // unread count
      .addCase(getUnreadNotificationsCount.pending, (state) => {
        state.isLoadingUnreadCount = true;
        state.isUnreadCountError = false;
      })
      .addCase(getUnreadNotificationsCount.fulfilled, (state, action) => {
        state.isLoadingUnreadCount = false;

        const payload: any = action.payload;
        // check the common shapes the server might send the count in
        const count =
          payload?.data?.count ??
          payload?.data?.unreadCount ??
          payload?.count ??
          payload?.unreadCount ??
          payload?.data ??
          0;

        state.unreadCount = typeof count === "number" ? count : 0;
      })
      .addCase(getUnreadNotificationsCount.rejected, (state, action) => {
        state.isLoadingUnreadCount = false;
        state.isUnreadCountError = true;
        state.unreadCountErrorMessage =
          (action.payload as string) || "Failed to load unread count";
      })

      // mark one notification as read
      .addCase(markNotificationAsRead.pending, (state, action) => {
        const { notificationId } = action.meta.arg;
        if (!state.markingReadIds.includes(notificationId)) {
          state.markingReadIds.push(notificationId);
        }
        // optimistic: assume it'll succeed, drop the badge count by one
        // (never below zero)
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const { notificationId } = action.payload;
        state.markingReadIds = state.markingReadIds.filter(
          (id) => id !== notificationId
        );
      })
      .addCase(markNotificationAsRead.rejected, (state, action: any) => {
        const notificationId =
          action.payload?.notificationId || action.meta.arg.notificationId;
        state.markingReadIds = state.markingReadIds.filter(
          (id) => id !== notificationId
        );
        state.errorMessage =
          action.payload?.message || "Failed to mark notification as read";
        // request failed: give the badge count back
        state.unreadCount += 1;
      })

      // mark all as read
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.isMarkingAllRead = true;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.isMarkingAllRead = false;
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.isMarkingAllRead = false;
        state.errorMessage =
          (action.payload as string) || "Failed to mark all as read";
      });
  },
});

export const { incrementUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;