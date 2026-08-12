import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const handleregister = createAsyncThunk(
  "register/handleregister",
  async (formValues: {
    name: string;
    email: string;
    password: string;
    dob: string;
    gender: string;
    repassword: string;
  }, thunkAPI) => {
    try {
      const response = await fetch(
        "https://route-posts.routemisr.com/users/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formValues.name,
            email: formValues.email,
            password: formValues.password,
            rePassword: formValues.repassword,
            dateOfBirth: formValues.dob,
            gender: formValues.gender,
          }),
        }
      );
      const data = await response.json();
      console.log(data)

      if (!response.ok) {
        console.log(data)
        return thunkAPI.rejectWithValue(data);
      }

      return data;

    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

let registerSlice = createSlice({
  name: "register",
  initialState: { name: "", email: "", password: "", dob: "", gender: "", repassword: "", isLoading: false, error: null as any },
  reducers: {

  },
  extraReducers: (builder) => {
    builder
      .addCase(handleregister.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(handleregister.fulfilled, (state, action) => {
        console.log(action)
        console.log(action.payload)
                console.log(action.payload.message)
                                console.log(action.payload.data.token)
          localStorage.setItem("token", action.payload.data.token);



        state.isLoading = false;

      })
      .addCase(handleregister.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
})

export default registerSlice.reducer;