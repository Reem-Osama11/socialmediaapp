import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const handlelogin= createAsyncThunk(
  "login/handlelogin",
  async (formValues: {
  
    email: string;
    password: string;

  }, thunkAPI) => {
    try {
      const response = await fetch(
        "https://route-posts.routemisr.com/users/signin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            
            email: formValues.email,
            password: formValues.password,
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

let loginSlice = createSlice({
  name: "login",
  initialState: { name: "", email: "", password: "", dob: "", gender: "", repassword: "", isLoading: false, error: null as any },
  reducers: {

  },
  extraReducers: (builder) => {
    builder
      .addCase(handlelogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(handlelogin.fulfilled, (state, action) => {
        console.log(action)
        console.log(action.payload)
                console.log(action.payload.message)
                                console.log(action.payload.data.token)
          localStorage.setItem("token", action.payload.data.token);



        state.isLoading = false;

      })
      .addCase(handlelogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
})

export default loginSlice.reducer;