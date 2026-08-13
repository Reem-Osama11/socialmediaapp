"use client";

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// ✅ 1. Import useDispatch و useSelector
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../../lib/store'; // عدّل المسار حسب مكان الـ store عندك

// ✅ 2. Import handlelogin من الـ slice
import { handlelogin } from '../../lib/loginslice'; // عدّل المسار حسب مكانك

// Types للـ RootState والـ Dispatch
type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Email is not valid')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

// ألوان الهوية البصرية للتطبيق
const BRAND = {
  gradient: 'linear-gradient(90deg, #6D28D9 0%, #9333EA 45%, #DB2777 100%)',
  bg: '#F5F3FF',
  deepPurple: '#4C1D95',
  purple: '#6D28D9',
  pink: '#DB2777',
  gold: '#FBBF24',
};

export default function LoginPage() {
  const router = useRouter();

  // ✅ 3. استخدم useDispatch و useSelector
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.login);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      // ✅ 4. Dispatch الـ handlelogin thunk
      const result = await dispatch(handlelogin(values));

      // ✅ 5. لو نجح → روح للـ Home
      if (handlelogin.fulfilled.match(result)) {
        router.push('/posts');
      }

      setSubmitting(false);
    },
  });

  const fieldSx = {
    '& .MuiFilledInput-root': {
      backgroundColor: 'rgba(109, 40, 217, 0.05)',
      borderRadius: 2.5,
      transition: 'background-color 0.2s ease',
      '&::before, &::after': { display: 'none' },
      '&:hover': { backgroundColor: 'rgba(109, 40, 217, 0.08)' },
      '&.Mui-focused': { backgroundColor: 'rgba(109, 40, 217, 0.08)' },
    },
    '& .MuiFilledInput-root.Mui-focused': {
      outline: `2px solid ${BRAND.purple}`,
      outlineOffset: '1px',
    },
    '& label.Mui-focused': { color: BRAND.purple },
    mb: 3,
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: BRAND.bg,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
        py: 6,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* بقعتين ضوء ديكوريتف بخلفية متناسقة مع باقي التطبيق */}
      <Box
        sx={{
          position: 'absolute',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(109,40,217,0.15), transparent 70%)',
          top: -140,
          left: -120,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(219,39,119,0.14), transparent 70%)',
          bottom: -120,
          right: -100,
        }}
      />

      <Paper
        elevation={0}
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 460,
          p: { xs: 3.5, md: 5 },
          borderRadius: 5,
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 20px 50px rgba(109, 40, 217, 0.15)',
        }}
      >
        <Stack spacing={1} sx={{ alignItems: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: BRAND.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              mb: 1,
              boxShadow: '0 8px 20px rgba(109, 40, 217, 0.35)',
            }}
          >
            ✨
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              background: BRAND.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Login
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Welcome back, sign in to keep up with the latest posts
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            {error?.message || 'Login failed. Please try again.'}
          </Alert>
        )}

        <TextField
          fullWidth
          variant="filled"
          id="email"
          name="email"
          label="Email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          sx={fieldSx}
        />

        <TextField
          fullWidth
          variant="filled"
          type="password"
          id="password"
          name="password"
          label="Password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          sx={fieldSx}
        />

        {/* ✅ لينك Change Password */}
        <Box sx={{ textAlign: 'right', mt: -2, mb: 3 }}>
          <Link
            href="/change-password"
            style={{ color: BRAND.purple, textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}
          >
            Change Password?
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          size="large"
          disabled={isLoading || formik.isSubmitting}
          sx={{
            py: 1.5,
            mt: 1,
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            color: '#fff',
            background: BRAND.gradient,
            boxShadow: '0 10px 24px rgba(109, 40, 217, 0.35)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              background: BRAND.gradient,
              transform: 'translateY(-1px)',
              boxShadow: '0 14px 30px rgba(109, 40, 217, 0.45)',
            },
            '&.Mui-disabled': {
              background: 'rgba(109, 40, 217, 0.4)',
              color: 'rgba(255,255,255,0.8)',
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Login'}
        </Button>

        <Typography sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            style={{ color: BRAND.pink, textDecoration: 'none', fontWeight: 700 }}
          >
            Sign up
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}