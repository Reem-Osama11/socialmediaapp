"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";

import { useDispatch, useSelector } from "react-redux";
import { store } from "../../lib/store";
import {
  handleChangePassword,
  resetChangePasswordState,
} from "../../lib/changePasswordSlice";

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

const validationSchema = Yup.object({
  password: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  rePassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm the new password"),
});

const BRAND = {
  gradient: "linear-gradient(90deg, #6D28D9 0%, #9333EA 45%, #DB2777 100%)",
  bg: "#F5F3FF",
  purple: "#6D28D9",
  pink: "#DB2777",
};

export default function ChangePasswordPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, success } = useSelector(
    (state: RootState) => state.changePassword
  );

  const formik = useFormik({
    initialValues: {
      password: "",
      newPassword: "",
      rePassword: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const result = await dispatch(
        handleChangePassword({
          password: values.password,
          newPassword: values.newPassword,
        })
      );

      if (handleChangePassword.fulfilled.match(result)) {
        resetForm();
        // ارجع بعد ثانيتين على الهوم (أو أي صفحة تانية)
        setTimeout(() => {
          dispatch(resetChangePasswordState());
          router.push("/");
        }, 2000);
      }

      setSubmitting(false);
    },
  });

  const fieldSx = {
    "& .MuiFilledInput-root": {
      backgroundColor: "rgba(109, 40, 217, 0.05)",
      borderRadius: 2.5,
      "&::before, &::after": { display: "none" },
      "&:hover": { backgroundColor: "rgba(109, 40, 217, 0.08)" },
      "&.Mui-focused": { backgroundColor: "rgba(109, 40, 217, 0.08)" },
    },
    "& .MuiFilledInput-root.Mui-focused": {
      outline: `2px solid ${BRAND.purple}`,
      outlineOffset: "1px",
    },
    "& label.Mui-focused": { color: BRAND.purple },
    mb: 3,
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: BRAND.bg,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        py: 6,
      }}
    >
      <Paper
        elevation={0}
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 460,
          p: { xs: 3.5, md: 5 },
          borderRadius: 5,
          boxShadow: "0 20px 50px rgba(109, 40, 217, 0.15)",
        }}
      >
        <Stack spacing={1} sx={{ alignItems: "center", mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              background: BRAND.gradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Change Password
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Update your account password
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            {error?.message || "Something went wrong. Please try again."}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>
            Password changed successfully! Redirecting...
          </Alert>
        )}

        <TextField
          fullWidth
          variant="filled"
          type="password"
          id="password"
          name="password"
          label="Current Password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          sx={fieldSx}
        />

        <TextField
          fullWidth
          variant="filled"
          type="password"
          id="newPassword"
          name="newPassword"
          label="New Password"
          value={formik.values.newPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.newPassword && Boolean(formik.errors.newPassword)
          }
          helperText={formik.touched.newPassword && formik.errors.newPassword}
          sx={fieldSx}
        />

        <TextField
          fullWidth
          variant="filled"
          type="password"
          id="rePassword"
          name="rePassword"
          label="Confirm New Password"
          value={formik.values.rePassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.rePassword && Boolean(formik.errors.rePassword)
          }
          helperText={formik.touched.rePassword && formik.errors.rePassword}
          sx={fieldSx}
        />

        <Button
          type="submit"
          fullWidth
          size="large"
          disabled={isLoading || formik.isSubmitting}
          sx={{
            py: 1.5,
            mt: 1,
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 700,
            fontSize: "1rem",
            color: "#fff",
            background: BRAND.gradient,
            boxShadow: "0 10px 24px rgba(109, 40, 217, 0.35)",
            "&:hover": {
              background: BRAND.gradient,
              transform: "translateY(-1px)",
            },
            "&.Mui-disabled": {
              background: "rgba(109, 40, 217, 0.4)",
              color: "rgba(255,255,255,0.8)",
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} sx={{ color: "#fff" }} />
          ) : (
            "Change Password"
          )}
        </Button>
      </Paper>
    </Box>
  );
}