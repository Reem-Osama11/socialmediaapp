"use client";

import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfileData, updateProfilePhoto } from "../../lib/profileslce";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";

// TODO: replace any with your real AppDispatch / RootState types from the store file
// import type { RootState, AppDispatch } from "../../lib/store";

export default function Profile() {
  const dispatch = useDispatch<any>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // reducer is registered under the key "photos" in the store (reducer: { photos: profileReducer })
  // this name must match exactly
  const { profileData, isLoading, isUploading, isError, errorMessage } =
    useSelector((state: any) => state.photos);

  useEffect(() => {
    dispatch(getProfileData());
  }, [dispatch]);

  function handlePhotoClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      dispatch(updateProfilePhoto(file));
    }
    e.target.value = "";
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F3FF", pb: 6 }}>
      <Container maxWidth="sm" sx={{ pt: 4 }}>
        {isError && (
          <Alert severity="error" sx={{ borderRadius: 3, mb: 3 }}>
            {errorMessage || "Failed to load profile data"}
          </Alert>
        )}

        <Card
          elevation={3}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {/* Cover / gradient header */}
          <Box
            sx={{
              height: 140,
              background:
                "linear-gradient(90deg, #6D28D9 0%, #9333EA 45%, #DB2777 100%)",
            }}
          />

          <Box sx={{ px: 3, pb: 4, textAlign: "center", mt: -8 }}>
            {isLoading ? (
              <Skeleton
                variant="circular"
                width={120}
                height={120}
                sx={{ mx: "auto", border: "4px solid #fff" }}
              />
            ) : (
              <Box sx={{ position: "relative", width: 120, mx: "auto" }}>
                <Avatar
                  src={profileData?.photo}
                  alt={profileData?.name}
                  sx={{
                    width: 120,
                    height: 120,
                    border: "4px solid #fff",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    fontSize: 40,
                    bgcolor: "#FBBF24",
                    color: "#4C1D95",
                    fontWeight: 700,
                  }}
                >
                  {profileData?.name?.[0]}
                </Avatar>

                <Box
                  onClick={handlePhotoClick}
                  sx={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    background:
                      "linear-gradient(135deg, #6D28D9, #DB2777)",
                    border: "2px solid #fff",
                    transition: "transform 0.2s ease",
                    "&:hover": { transform: "scale(1.08)" },
                  }}
                >
                  {isUploading ? (
                    <CircularProgress size={16} sx={{ color: "#fff" }} />
                  ) : (
                    <CameraAltRoundedIcon sx={{ fontSize: 18, color: "#fff" }} />
                  )}
                </Box>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </Box>
            )}

            <Box sx={{ mt: 2 }}>
              {isLoading ? (
                <>
                  <Skeleton width="50%" height={28} sx={{ mx: "auto" }} />
                  <Skeleton width="35%" height={20} sx={{ mx: "auto" }} />
                </>
              ) : (
                <>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: "#4C1D95" }}
                  >
                    {profileData?.name || "User"}
                  </Typography>

                  {profileData?.email && (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ mt: 0.5, alignItems: "center", justifyContent: "center" }}
                    >
                      <EmailRoundedIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {profileData.email}
                      </Typography>
                    </Stack>
                  )}
                </>
              )}
            </Box>

            {!isLoading && (
              <Button
                onClick={handlePhotoClick}
                disabled={isUploading}
                startIcon={
                  isUploading ? (
                    <CircularProgress size={16} sx={{ color: "#fff" }} />
                  ) : (
                    <CameraAltRoundedIcon />
                  )
                }
                sx={{
                  mt: 3,
                  px: 3,
                  py: 1,
                  borderRadius: 999,
                  color: "#fff",
                  fontWeight: 600,
                  textTransform: "none",
                  background:
                    "linear-gradient(90deg, #6D28D9, #DB2777)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #5B21B6, #BE185D)",
                  },
                }}
              >
                {isUploading ? "Uploading..." : "Change profile photo"}
              </Button>
            )}
          </Box>
        </Card>

      </Container>
    </Box>
  );
}