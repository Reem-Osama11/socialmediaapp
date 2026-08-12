"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFollowSuggestions, toggleFollowUser } from "../../lib/profileslce";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import PersonRemoveRoundedIcon from "@mui/icons-material/PersonRemoveRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

// TODO: replace any with your real AppDispatch / RootState types from the store file
// import type { RootState, AppDispatch } from "../../lib/store";

interface FollowSuggestionsProps {
  sx?: object; // lets you control width/sticky positioning from outside if needed
  pageSize?: number; // how many users to fetch per page from the server (default 5)
}

export default function FollowSuggestions({
  sx,
  pageSize = 5,
}: FollowSuggestionsProps) {
  const dispatch = useDispatch<any>();

  // reducer is registered under the key "photos" in the store (reducer: { photos: profileReducer })
  const {
    suggestions,
    isSuggestionsLoading,
    isSuggestionsError,
    suggestionsErrorMessage,
    suggestionsPagination,
    followLoadingIds,
  } = useSelector((state: any) => state.photos);

  const currentPage = suggestionsPagination?.currentPage ?? 1;
  const numberOfPages = suggestionsPagination?.numberOfPages ?? null;

  // fetch page 1 on mount
  useEffect(() => {
    dispatch(getFollowSuggestions({ limit: pageSize, page: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // if the backend told us how many pages exist, trust it. Otherwise fall back to:
  // "there's probably a next page as long as this page came back full"
  const canGoNext = numberOfPages
    ? currentPage < numberOfPages
    : (suggestions?.length ?? 0) >= pageSize;
  const canGoPrev = currentPage > 1;

  function handleToggleFollow(userId: string) {
    dispatch(toggleFollowUser({ userId }));
  }

  function goToPage(page: number) {
    dispatch(getFollowSuggestions({ limit: pageSize, page }));
  }

  function handleNext() {
    if (canGoNext && !isSuggestionsLoading) goToPage(currentPage + 1);
  }

  function handlePrev() {
    if (canGoPrev && !isSuggestionsLoading) goToPage(currentPage - 1);
  }

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 4,
        p: 3,
        ...sx,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <GroupRoundedIcon sx={{ color: "#6D28D9" }} />
          <Typography sx={{ fontWeight: 800, color: "#4C1D95" }}>
            Follow Suggestions
          </Typography>
        </Stack>

        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Page {currentPage}
        </Typography>
      </Stack>

      {isSuggestionsError && (
        <Alert severity="error" sx={{ borderRadius: 3, mb: 2 }}>
          {suggestionsErrorMessage || "Failed to load suggestions"}
        </Alert>
      )}

      {isSuggestionsLoading ? (
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Stack
              key={i}
              direction="row"
              spacing={2}
              sx={{ alignItems: "center" }}
            >
              <Skeleton variant="circular" width={48} height={48} />
              <Skeleton width="60%" height={20} />
            </Stack>
          ))}
        </Stack>
      ) : suggestions?.length ? (
        <>
          <Stack divider={<Divider flexItem />} spacing={2}>
            {suggestions.map((user: any) => {
              const userId = user._id;
              const isLoadingThisUser = followLoadingIds?.includes(userId);
              const followed = Boolean(user.isFollowed);

              return (
                <Stack
                  key={userId}
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center", justifyContent: "space-between" }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: "center", minWidth: 0 }}
                  >
                    <Avatar
                      src={user.photo}
                      alt={user.name}
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: "#FBBF24",
                        color: "#4C1D95",
                        fontWeight: 700,
                      }}
                    >
                      {user.name?.[0]}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "#4C1D95",
                          fontSize: 14,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {user.name || "User"}
                      </Typography>
                      {user.email && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {user.email}
                        </Typography>
                      )}
                    </Box>
                  </Stack>

                  <Button
                    onClick={() => handleToggleFollow(userId)}
                    disabled={isLoadingThisUser}
                    size="small"
                    startIcon={
                      isLoadingThisUser ? (
                        <CircularProgress
                          size={14}
                          sx={{ color: followed ? "#6D28D9" : "#fff" }}
                        />
                      ) : followed ? (
                        <PersonRemoveRoundedIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <PersonAddAlt1RoundedIcon sx={{ fontSize: 16 }} />
                      )
                    }
                    sx={{
                      flexShrink: 0,
                      borderRadius: 999,
                      px: 1.5,
                      minWidth: 0,
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: "none",
                      ...(followed
                        ? {
                            color: "#6D28D9",
                            border: "1.5px solid #6D28D9",
                            "&:hover": {
                              background: "rgba(109, 40, 217, 0.08)",
                            },
                          }
                        : {
                            color: "#fff",
                            background:
                              "linear-gradient(90deg, #6D28D9, #DB2777)",
                            "&:hover": {
                              background:
                                "linear-gradient(90deg, #5B21B6, #BE185D)",
                            },
                          }),
                    }}
                  >
                    {isLoadingThisUser ? "" : followed ? "Unfollow" : "Follow"}
                  </Button>
                </Stack>
              );
            })}
          </Stack>

          {(canGoNext || canGoPrev) && (
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: "center", justifyContent: "center", mt: 2.5 }}
            >
              <IconButton
                onClick={handlePrev}
                disabled={!canGoPrev || isSuggestionsLoading}
                size="small"
                sx={{
                  border: "1.5px solid #E9D5FF",
                  color: canGoPrev ? "#6D28D9" : "#C4B5FD",
                }}
                aria-label="Previous suggestions"
              >
                <KeyboardArrowUpRoundedIcon />
              </IconButton>

              <IconButton
                onClick={handleNext}
                disabled={!canGoNext || isSuggestionsLoading}
                size="small"
                sx={{
                  border: "1.5px solid #E9D5FF",
                  color: canGoNext ? "#6D28D9" : "#C4B5FD",
                }}
                aria-label="Next suggestions"
              >
                <KeyboardArrowDownRoundedIcon />
              </IconButton>
            </Stack>
          )}
        </>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No follow suggestions right now
        </Typography>
      )}
    </Card>
  );
}