"use client";

import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { handleregister } from '../../lib/registerslice';
import type { AppDispatch, RootState } from '../../lib/store'

// Workaround for a TypeScript overload-resolution conflict on MUI's <Stack>
// (likely caused by duplicate/mismatched @types/react or @mui/material
// versions in node_modules — run `npm ls @mui/material` and `npm ls @types/react`
// locally to confirm, then `npm dedupe` to fix it at the root).
// Casting to `any` here just lets this file build in the meantime without
// touching Stack's real runtime behavior at all.
const FlexStack = Stack as any;

// سكيما الـ Validation بتاعة Yup
const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .required('Name is required'),

  email: Yup.string()
    .email('Email is not valid')
    .required('Email is required'),

  dob: Yup.date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .required('Date of birth is required'),

  gender: Yup.string()
    .oneOf(['male', 'female'], 'Select a valid gender')
    .required('Gender is required'),

  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),

  repassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

// ألوان الهوية البصرية للتطبيق (نفس البالتة المستخدمة في الـ Navbar وصفحة تسجيل الدخول)
const BRAND = {
  gradient: 'linear-gradient(90deg, #6D28D9 0%, #9333EA 45%, #DB2777 100%)',
  bg: '#F5F3FF',
  deepPurple: '#4C1D95',
  purple: '#6D28D9',
  pink: '#DB2777',
};

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.register);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      dob: '',
      gender: '',
      password: '',
      repassword: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await dispatch(handleregister(values)).unwrap();
        router.push("/login");
      } catch (err) {
        console.log(err);
      } finally {
        setSubmitting(false);
      }
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
        px: 2,
        py: { xs: 5, md: 8 },
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
          maxWidth: 700,
          p: { xs: 3.5, md: 5 },
          height: 'fit-content',
          borderRadius: 5,
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 20px 50px rgba(109, 40, 217, 0.15)',
        }}
      >
        <FlexStack alignItems="center" spacing={1} sx={{ mb: 4 }}>
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
            Sign Up
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Join us and keep up with the latest posts
          </Typography>
        </FlexStack>

        <TextField
          fullWidth
          variant="filled"
          id="name"
          name="name"
          label="Name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
          sx={fieldSx}
        />

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
          type="date"
          id="dob"
          name="dob"
          label="Date of birth"
          value={formik.values.dob}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.dob && Boolean(formik.errors.dob)}
          helperText={formik.touched.dob && formik.errors.dob}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={fieldSx}
        />

        <TextField
          fullWidth
          select
          variant="filled"
          id="gender"
          name="gender"
          label="Gender"
          value={formik.values.gender}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.gender && Boolean(formik.errors.gender)}
          helperText={formik.touched.gender && formik.errors.gender}
          sx={fieldSx}
        >
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
        </TextField>

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

        <TextField
          fullWidth
          variant="filled"
          type="password"
          id="repassword"
          name="repassword"
          label="Repassword"
          value={formik.values.repassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.repassword && Boolean(formik.errors.repassword)}
          helperText={formik.touched.repassword && formik.errors.repassword}
          sx={fieldSx}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            {typeof error === 'string' ? error : error?.message || 'An error occurred during registration'}
          </Alert>
        )}

        <Button
          type="submit"
          fullWidth
          size="large"
          disabled={isLoading}
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
          {isLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign Up'}
        </Button>

        <Typography sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
          Already have an account?{' '}
          <Link
            href="/login"
            style={{ color: BRAND.pink, textDecoration: 'none', fontWeight: 700 }}
          >
            Login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}