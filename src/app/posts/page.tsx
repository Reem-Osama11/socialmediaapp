




import "use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { getAllPosts, createPost } from "../../lib/postsslice";
import {
  getCommentsForPost,
  createComment,
  updateComment,
  deleteComment,
  toggleLikeComment,
} from "../../lib/commentsslice";
import FollowSuggestions from "../followsuggestion/page";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

function timeAgo(dateString: any) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);

  const intervals = [
    { label: "year", secs: 31536000 },
    { label: "month", secs: 2592000 },
    { label: "day", secs: 86400 },
    { label: "hour", secs: 3600 },
    { label: "minute", secs: 60 },
  ];

  for (const i of intervals) {
    const count = Math.floor(seconds / i.secs);
    if (count >= 1) return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

function normalizeId(value: any) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return String(value._id);
  return String(value);
}

function getCurrentUserId() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const decoded = jwtDecode(token);

    return normalizeId(
      decoded.user ||
        decoded.id ||
        decoded._id ||
        decoded.userId ||
        decoded.uid ||
        decoded.sub
    );
  } catch {
    return null;
  }
}

function PostSkeleton() {
  return (
    <Card sx={{ borderRadius: 4, overflow: "hidden", mb: 3 }} elevation={2}>
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: "center" }}>
          <Skeleton variant="circular" width={44} height={44} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="40%" height={20} />
            <Skeleton width="25%" height={16} />
          </Box>
        </Stack>
        <Skeleton width="90%" />
        <Skeleton width="70%" />
      </CardContent>
      <Skeleton variant="rectangular" height={280} />
    </Card>
  );
}

function CommentComposer({ postId, isPosting, postError }: any) {
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = React.useRef(null);

  function handleImagePick(e: any) {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
    e.target.value = "";
  }

  function removeImage() {
    setImage(null);
    setImagePreview(null);
  }

  function handleSubmit() {
    if (!text.trim() && !image) return;
    dispatch(createComment({ postId, content: text.trim(), image })).then((res: any) => {
      if (!res.error) {
        setText("");
        removeImage();
      }
    });
  }

  return (
    <Box sx={{ pt: 1.5 }}>
      {postError && (
        <Alert severity="error" sx={{ borderRadius: 2, mb: 1 }}>
          {postError}
        </Alert>
      )}

      {imagePreview && (
        <Box sx={{ position: "relative", display: "inline-block", mb: 1 }}>
          <Box
            component="img"
            src={imagePreview}
            alt="preview"
            sx={{ width: 70, height: 70, borderRadius: 2, objectFit: "cover" }}
          />
          <IconButton
            size="small"
            onClick={removeImage}
            sx={{
              position: "absolute",
              top: -6,
              right: -6,
              bgcolor: "#fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              width: 20,
              height: 20,
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      )}

      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Write a comment..."
          value={text}
          onChange={(e: any) => setText(e.target.value)}
          onKeyDown={(e: any) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={isPosting}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 999,
              bgcolor: "#fff",
            },
          }}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImagePick}
        />
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          disabled={isPosting}
          sx={{ color: "#6D28D9" }}
        >
          <ImageRoundedIcon />
        </IconButton>

        <IconButton
          onClick={handleSubmit}
          disabled={isPosting || (!text.trim() && !image)}
          sx={{
            bgcolor: "#6D28D9",
            color: "#fff",
            "&:hover": { bgcolor: "#5B21B6" },
            "&.Mui-disabled": { bgcolor: "rgba(109,40,217,0.3)", color: "#fff" },
          }}
        >
          {isPosting ? (
            <CircularProgress size={18} sx={{ color: "#fff" }} />
          ) : (
            <SendRoundedIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      </Stack>
    </Box>
  );
}

// ---------- Single comment: view / edit / delete / like ----------
function CommentItem({ postId, comment, currentUserId }: any) {
  const dispatch = useDispatch();

  const commentUserId = normalizeId(
    comment.commentCreator?._id ||
      comment.commentCreator ||
      comment.user?._id ||
      comment.user ||
      comment.userId ||
      comment.createdBy?._id ||
      comment.createdBy
  );

  const isOwner = Boolean(
    currentUserId && commentUserId && currentUserId === commentUserId
  );

  const isLikedByMe =
    Array.isArray(comment.likes) && currentUserId
      ? comment.likes.some((l: any) => normalizeId(l) === currentUserId)
      : false;
  const likesCount = comment.likes?.length ?? comment.likesCount ?? 0;

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(
    comment.content || comment.body || comment.text || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  function openMenu(e: any) {
    setMenuAnchor(e.currentTarget);
  }
  function closeMenu() {
    setMenuAnchor(null);
  }

  function startEdit() {
    setEditText(comment.content || comment.body || comment.text || "");
    setIsEditing(true);
    closeMenu();
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  function saveEdit() {
    if (!editText.trim()) return;
    setIsSaving(true);
    dispatch(
      updateComment({ postId, commentId: comment._id, content: editText.trim() })
    ).finally(() => {
      setIsSaving(false);
      setIsEditing(false);
    });
  }

  function handleDelete() {
    closeMenu();
    setIsDeleting(true);
    dispatch(deleteComment({ postId, commentId: comment._id })).finally(() => {
      setIsDeleting(false);
    });
  }

  function handleLike() {
    setIsLiking(true);
    dispatch(toggleLikeComment({ postId, commentId: comment._id })).finally(() => {
      setIsLiking(false);
    });
  }

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        alignItems: "flex-start",
        p: 1.5,
        borderRadius: 3,
        bgcolor: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        opacity: isDeleting ? 0.5 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      <Avatar
        src={comment.commentCreator?.photo || comment.user?.photo}
        alt={comment.commentCreator?.name || comment.user?.name}
        sx={{ width: 32, height: 32, bgcolor: "#FBBF24", fontSize: 14 }}
      >
        {(comment.commentCreator?.name || comment.user?.name || "?")[0]}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#4C1D95" }}>
            {comment.commentCreator?.name || comment.user?.name || "User"}
          </Typography>

          {isOwner && !isEditing && (
            <>
              <IconButton size="small" onClick={openMenu} sx={{ p: 0.4 }}>
                <MoreVertRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              </IconButton>
              <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
                <MenuItem onClick={startEdit}>
                  <ListItemIcon>
                    <EditRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  Edit
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
                  <ListItemIcon>
                    <DeleteRoundedIcon fontSize="small" sx={{ color: "error.main" }} />
                  </ListItemIcon>
                  Delete
                </MenuItem>
              </Menu>
            </>
          )}
        </Stack>

        {isEditing ? (
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, alignItems: "center" }}>
            <TextField
              fullWidth
              size="small"
              value={editText}
              onChange={(e: any) => setEditText(e.target.value)}
              disabled={isSaving}
              autoFocus
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 999, bgcolor: "#F5F3FF" },
              }}
            />
            <IconButton
              size="small"
              onClick={saveEdit}
              disabled={isSaving || !editText.trim()}
              sx={{ bgcolor: "#6D28D9", color: "#fff", "&:hover": { bgcolor: "#5B21B6" } }}
            >
              {isSaving ? (
                <CircularProgress size={14} sx={{ color: "#fff" }} />
              ) : (
                <CheckRoundedIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
            <IconButton size="small" onClick={cancelEdit} disabled={isSaving}>
              <CloseRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: "text.primary", mt: 0.3 }}>
            {comment.content || comment.body || comment.text}
          </Typography>
        )}

        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mt: 0.6 }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {timeAgo(comment.createdAt)}
          </Typography>

          <Stack
            direction="row"
            spacing={0.4}
            onClick={handleLike}
            sx={{
              alignItems: "center",
              cursor: "pointer",
              color: isLikedByMe ? "#DB2777" : "text.secondary",
              "&:hover": { color: "#DB2777" },
            }}
          >
            {isLiking ? (
              <CircularProgress size={12} sx={{ color: "#DB2777" }} />
            ) : isLikedByMe ? (
              <FavoriteRoundedIcon sx={{ fontSize: 14 }} />
            ) : (
              <FavoriteBorderRoundedIcon sx={{ fontSize: 14 }} />
            )}
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {likesCount > 0 ? likesCount : "Like"}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

function CreatePostBox() {
  const dispatch = useDispatch();
  const { isPosting, postError } = useSelector((state: any) => state.posts);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = React.useRef(null);

  function handleImagePick(e: any) {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
    e.target.value = "";
  }

  function removeImage() {
    setImage(null);
    setImagePreview(null);
  }

  function handleSubmit() {
    if (!text.trim() && !image) return;
    dispatch(createPost({ body: text.trim(), image })).then((res: any) => {
      if (!res.error) {
        setText("");
        removeImage();
      }
    });
  }

  return (
    <Card elevation={3} sx={{ borderRadius: 4, p: 2, mb: 3 }}>
      {postError && (
        <Alert severity="error" sx={{ borderRadius: 2, mb: 1.5 }}>
          {postError}
        </Alert>
      )}

      <TextField
        fullWidth
        multiline
        minRows={2}
        placeholder="What's on your mind?"
        value={text}
        onChange={(e: any) => setText(e.target.value)}
        disabled={isPosting}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            bgcolor: "#F5F3FF",
          },
        }}
      />

      {imagePreview && (
        <Box sx={{ position: "relative", display: "inline-block", mt: 1.5 }}>
          <Box
            component="img"
            src={imagePreview}
            alt="preview"
            sx={{ maxHeight: 200, borderRadius: 2, objectFit: "cover" }}
          />
          <IconButton
            size="small"
            onClick={removeImage}
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              bgcolor: "#fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              width: 24,
              height: 24,
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      )}

      <Divider sx={{ my: 1.5 }} />

      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImagePick}
        />
        <Chip
          icon={<ImageRoundedIcon sx={{ color: "#6D28D9 !important" }} />}
          label="Photo"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPosting}
          sx={{
            bgcolor: "rgba(109, 40, 217, 0.08)",
            fontWeight: 600,
            cursor: "pointer",
            "&:hover": { bgcolor: "rgba(109, 40, 217, 0.15)" },
          }}
        />

        <Chip
          icon={
            isPosting ? (
              <CircularProgress size={14} sx={{ color: "#fff !important" }} />
            ) : (
              <SendRoundedIcon sx={{ color: "#fff !important" }} />
            )
          }
          label={isPosting ? "Posting..." : "Post"}
          onClick={!isPosting ? handleSubmit : undefined}
          disabled={isPosting || (!text.trim() && !image)}
          sx={{
            bgcolor: "#6D28D9",
            color: "#fff",
            fontWeight: 700,
            px: 1,
            cursor: "pointer",
            "&:hover": { bgcolor: "#5B21B6" },
            "&.Mui-disabled": { bgcolor: "rgba(109,40,217,0.3)", color: "#fff" },
          }}
        />
      </Stack>
    </Card>
  );
}

export default function Posts() {
  const dispatch = useDispatch();
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const { allPosts, pagination, isLoading, isLoadingMore, isError, errorMessage } =
    useSelector((state: any) => state.posts);
  const { commentsByPost } = useSelector((state: any) => state.comments);

  useEffect(() => {
    dispatch(getAllPosts({ page: 1, limit: 20 }));
    setCurrentUserId(getCurrentUserId());
  }, [dispatch]);

  const postsArray = Array.isArray(allPosts) ? allPosts : [];

  // fetch comments for every loaded post in the background, right away, so the
  // comment count is accurate and visible immediately - no need to click first.
  // this also means the count is always correct again after a full page refresh.
  useEffect(() => {
    const postsNeedingFetch = postsArray.filter(
      (post: any) => !commentsByPost?.[post._id]
    );

    // stagger requests instead of firing them all at once - avoids tripping any
    // rate limit on the backend, which would otherwise leave some posts stuck
    // showing the fallback count forever because their request kept failing
    const timers = postsNeedingFetch.map((post: any, index: number) =>
      setTimeout(() => {
        dispatch(getCommentsForPost({ postId: post._id }));
      }, index * 150)
    );

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postsArray, dispatch]);

  const toggleComments = (postId: any) => {
    setExpandedPostId((current: any) => (current === postId ? null : postId));
  };

  // pagination.currentPage / numberOfPages come from the backend's meta.pagination
  // (field names covered defensively in case they differ slightly)
  const currentPage = pagination?.currentPage ?? pagination?.page ?? 1;
  const numberOfPages =
    pagination?.numberOfPages ?? pagination?.totalPages ?? pagination?.pages ?? null;
  const hasMorePages = numberOfPages ? currentPage < numberOfPages : false;

  function handleLoadMore() {
    if (isLoadingMore) return;
    dispatch(getAllPosts({ page: currentPage + 1, limit: 20 }));
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F5F3FF",
        pb: 6,
      }}
    >
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        <Stack
          direction={{ xs: "column-reverse", md: "row" }}
          spacing={3}
          sx={{ alignItems: "flex-start" }}
        >
          {/* ------- Sidebar: Follow Suggestions ------- */}
          <Box
            sx={{
              width: { xs: "100%", md: 300 },
              flexShrink: 0,
              position: { md: "sticky" },
              top: { md: 96 },
            }}
          >
            <FollowSuggestions />
          </Box>

          {/* ------- Main feed ------- */}
          <Box sx={{ flex: 1, minWidth: 0, maxWidth: 600, mx: { xs: "auto", md: 0 } }}>
            <Stack
              direction="row"
              sx={{ mb: 3, alignItems: "center", justifyContent: "space-between" }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  background: "linear-gradient(90deg, #6D28D9, #DB2777)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                ✨ Latest Posts
              </Typography>
              {pagination?.total ? (
                <Chip
                  label={`${pagination.total.toLocaleString("en-US")} posts`}
                  size="small"
                  sx={{ bgcolor: "rgba(109, 40, 217, 0.08)", fontWeight: 700, color: "#6D28D9" }}
                />
              ) : null}
            </Stack>

            {isError && (
              <Alert severity="error" sx={{ borderRadius: 3, mb: 3 }}>
                {errorMessage || "Something went wrong while loading posts, please try again"}
              </Alert>
            )}

            <CreatePostBox />

            {isLoading && postsArray.length === 0 && (
              <>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
              </>
            )}

            {!isLoading && !isError && postsArray.length === 0 && (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                No posts to show right now
              </Alert>
            )}

            {postsArray.map((post: any) => {
              const isExpanded = expandedPostId === post._id;
              const postCommentsState = commentsByPost?.[post._id];
              const postComments = postCommentsState?.items ?? [];
              const commentsLoading = postCommentsState?.isLoading;
              const commentsError = postCommentsState?.isError;

              // only trust the live count once that post's comments actually finished
              // loading successfully - not the moment the request merely starts (pending
              // already creates an entry with empty items, which would show "0" for a
              // split second, or forever if that particular request fails/rate-limits)
              const hasLoadedComments =
                Boolean(postCommentsState) &&
                !postCommentsState.isLoading &&
                !postCommentsState.isError;

              const commentsCount = hasLoadedComments
                ? postComments.length
                : post.comments?.length ?? post.commentsCount ?? 0;

              return (
                <Card
                  key={post._id}
                  elevation={3}
                  sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    mb: 3,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 12px 28px rgba(109, 40, 217, 0.18)",
                    },
                  }}
                >
                  <CardContent sx={{ pb: 1.5 }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                      <Avatar
                        src={post.user?.photo}
                        alt={post.user?.name}
                        sx={{
                          width: 46,
                          height: 46,
                          border: "2px solid #DB2777",
                        }}
                      >
                        {post.user?.name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: "#4C1D95" }}>
                          {post.user?.name || "User"}
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                          <AccessTimeRoundedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary">
                            {timeAgo(post.createdAt)}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>

                    {post.body && (
                      <Typography sx={{ mt: 2, mb: post.image ? 0 : 1, lineHeight: 1.7 }}>
                        {post.body}
                      </Typography>
                    )}
                  </CardContent>

                  {post.image && (
                    <CardMedia
                      component="img"
                      image={post.image}
                      alt="post"
                      loading="lazy"
                      sx={{
                        maxHeight: 420,
                        objectFit: "cover",
                      }}
                    />
                  )}

                  <Divider sx={{ mx: 2 }} />

                  <Stack direction="row" spacing={1} sx={{ px: 2, py: 1.2, alignItems: "center" }}>
                    <Chip
                      icon={<FavoriteRoundedIcon sx={{ color: "#DB2777 !important" }} />}
                      label={post.likes?.length ?? post.likesCount ?? 0}
                      size="small"
                      sx={{ bgcolor: "rgba(219, 39, 119, 0.08)", fontWeight: 600 }}
                    />

                    <Chip
                      icon={
                        isExpanded ? (
                          <ExpandLessRoundedIcon sx={{ color: "#6D28D9 !important" }} />
                        ) : (
                          <ChatBubbleOutlineRoundedIcon sx={{ color: "#6D28D9 !important" }} />
                        )
                      }
                      label={`${commentsCount} ${
                        isExpanded ? "Hide" : "Comments"
                      }`}
                      size="small"
                      onClick={() => toggleComments(post._id)}
                      sx={{
                        bgcolor: "rgba(109, 40, 217, 0.08)",
                        fontWeight: 600,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "rgba(109, 40, 217, 0.15)" },
                      }}
                    />

                    <Box sx={{ flexGrow: 1 }} />
                    <ShareRoundedIcon sx={{ fontSize: 20, color: "text.secondary", cursor: "pointer" }} />
                  </Stack>

                  {isExpanded && (
                    <Box
                      sx={{
                        px: 2,
                        pb: 2,
                        pt: 0.5,
                        bgcolor: "rgba(245, 243, 255, 0.6)",
                      }}
                    >
                      <CommentComposer
                        postId={post._id}
                        isPosting={postCommentsState?.isPosting}
                        postError={postCommentsState?.postError}
                      />

                      {commentsLoading ? (
                        <Stack sx={{ py: 2, alignItems: "center" }}>
                          <CircularProgress size={20} sx={{ color: "#6D28D9" }} />
                        </Stack>
                      ) : commentsError ? (
                        <Typography
                          variant="body2"
                          sx={{ py: 2, textAlign: "center", color: "error.main" }}
                        >
                          Couldn't load comments
                        </Typography>
                      ) : postComments.length === 0 ? (
                        <Typography
                          variant="body2"
                          sx={{ py: 2, textAlign: "center", color: "text.secondary" }}
                        >
                          No comments yet
                        </Typography>
                      ) : (
                        <Stack spacing={1.5} sx={{ pt: 2 }}>
                          {postComments.map((comment: any) => (
                            <CommentItem
                              key={comment._id}
                              postId={post._id}
                              comment={comment}
                              currentUserId={currentUserId}
                            />
                          ))}
                        </Stack>
                      )}
                    </Box>
                  )}
                </Card>
              );
            })}

            {isLoading && postsArray.length > 0 && (
              <Stack sx={{ py: 3, alignItems: "center" }}>
                <CircularProgress size={28} sx={{ color: "#6D28D9" }} />
              </Stack>
            )}

            {!isLoading && postsArray.length > 0 && (
              <Stack sx={{ py: 2, alignItems: "center" }}>
                {hasMorePages ? (
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    variant="outlined"
                    startIcon={
                      isLoadingMore ? (
                        <CircularProgress size={16} sx={{ color: "#6D28D9" }} />
                      ) : null
                    }
                    sx={{
                      borderRadius: 999,
                      px: 3,
                      py: 1,
                      fontWeight: 700,
                      textTransform: "none",
                      borderColor: "#6D28D9",
                      color: "#6D28D9",
                      "&:hover": {
                        borderColor: "#5B21B6",
                        bgcolor: "rgba(109, 40, 217, 0.06)",
                      },
                    }}
                  >
                    {isLoadingMore ? "Loading..." : "Load more posts"}
                  </Button>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    You've reached the end
                  </Typography>
                )}
              </Stack>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}