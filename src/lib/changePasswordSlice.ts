import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const handleChangePassword = createAsyncThunk(
  "changePassword/handleChangePassword",
  async (
    formValues: {
      password: string;
      newPassword: string;
    },
    thunkAPI
  ) => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const response = await fetch(
        "https://route-posts.routemisr.com/users/change-password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            password: formValues.password,
            newPassword: formValues.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return thunkAPI.rejectWithValue(data);
      }

      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const changePasswordSlice = createSlice({
  name: "changePassword",
  initialState: {
    isLoading: false,
    error: null as any,
    success: false,
  },
  reducers: {
    resetChangePasswordState: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(handleChangePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(handleChangePassword.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.success = true;

        // الـ API بترجع توكن جديد بعد تغيير الباسورد
        if (action.payload?.token) {
          localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(handleChangePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetChangePasswordState } = changePasswordSlice.actions;
export default changePasswordSlice.reducer;